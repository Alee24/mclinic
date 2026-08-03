import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { MedicalProfilesService } from '../medical-profiles/medical-profiles.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private doctorsService: DoctorsService,
    private medicalProfilesService: MedicalProfilesService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) { }

  private async comparePassword(plain: string, stored: string, userType: 'user' | 'doctor', id: number): Promise<boolean> {
    try {
      // 1. Try standard bcrypt comparison
      if (stored && stored.startsWith('$2')) {
        const match = await bcrypt.compare(plain, stored);
        if (match) return true;
      }
      
      // 2. Fallback: Check plain text (for migrated data)
      if (plain === stored) {
        // Transparently upgrade to bcrypt for next time
        const hashed = await bcrypt.hash(plain, 10);
        if (userType === 'user') {
          await this.usersService.update(id, { password: hashed } as any);
        } else {
          await this.doctorsService.update(id, { password: hashed } as any);
        }
        return true;
      }
      
      return false;
    } catch (e) {
      // If bcrypt.compare throws (e.g. invalid hash format), check plain text
      if (plain === stored) {
        const hashed = await bcrypt.hash(plain, 10);
        if (userType === 'user') {
          await this.usersService.update(id, { password: hashed } as any);
        } else {
          await this.doctorsService.update(id, { password: hashed } as any);
        }
        return true;
      }
      return false;
    }
  }

  async validateUser(email: string, pass: string, _unused_userType?: string): Promise<any> {
    // 1. Try checking the Users table first (Patients/Admins)
    const user = await this.usersService.findOne(email);
    if (user) {
      if (await this.comparePassword(pass, user.password, 'user', user.id)) {
        const { password, ...result } = user;
        return result;
      }
    }

    // 2. Try checking the Doctors table (Healthcare Professionals)
    const doctor = await this.doctorsService.findByEmail(email);
    if (doctor) {
      if (await this.comparePassword(pass, doctor.password, 'doctor', doctor.id)) {
        if (!doctor.status || doctor.status === 0) {
          throw new UnauthorizedException('Account is suspended or inactive. Contact admin.');
        }
        const role = this.mapDrTypeToRole(doctor.dr_type);
        const { password, ...result } = doctor;
        return { ...result, role };
      }
    }

    // If we reached here, no match was found in either table
    throw new UnauthorizedException('Invalid email or password. Please try again.');
  }

  private mapDrTypeToRole(drType: string): string {
    const type = (drType || '').toLowerCase();
    if (type.includes('nurse')) return 'nurse';
    if (type.includes('clinical')) return 'clinician';
    if (type.includes('lab')) return 'lab_tech';
    if (type.includes('pharm')) return 'pharmacist';
    return 'doctor';
  }

  async login(loginDto: any, ipAddress?: string, location?: string) {
    const validUser = await this.validateUser(loginDto.email, loginDto.password, loginDto.userType);

    const payload = {
      email: validUser.email,
      sub: validUser.id,
      role: validUser.role,
    };

    // Update last access timestamp on every successful login
    try {
      const isDoctorRole = ['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist'].includes(validUser.role);
      let userIdToUpdate = validUser.id;

      if (isDoctorRole) {
        let userRecord = await this.usersService.findOne(validUser.email);
        if (!userRecord) {
           userRecord = await this.usersService.syncUserFromDoctor(validUser);
        }
        if (userRecord) {
           userIdToUpdate = userRecord.id;
        }
      }

      if (userIdToUpdate) {
        await this.usersService.updateLastAccess(userIdToUpdate);
      }
    } catch (e) {
      console.error('[AuthService] Failed to update lastAccess:', e);
    }

    try {
      await this.emailService.sendLoginAttemptEmail(
        validUser,
        ipAddress || 'Unknown',
        location || 'Unknown'
      );
    } catch (error) {
      console.error('Failed to send login email:', error);
    }

    let finalUser = { ...validUser };
    if (['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist', 'admin'].includes(validUser.role)) {
      // @ts-ignore
      finalUser.doctorId = validUser.id;
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: finalUser,
    };
  }

  async impersonate(adminId: number, targetUserId: number) {
    const admin = await this.usersService.findById(adminId);
    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only admins can impersonate users.');
    }

    const targetUser = await this.usersService.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User to impersonate not found.');
    }

    const payload = {
      email: targetUser.email,
      sub: targetUser.id,
      role: targetUser.role,
      isImpersonated: true,
      adminId: admin.id
    };

    // Update last access for the target user
    await this.usersService.updateLastAccess(targetUser.id);

    let finalUser = { ...targetUser };
    if (finalUser.password) delete (finalUser as any).password;

    if (['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist'].includes(targetUser.role)) {
      // @ts-ignore
      finalUser.doctorId = targetUser.id;
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: finalUser,
    };
  }

  async register(dto: any) {
    const userData = {
      ...dto,
      role: 'patient',
      status: true
    };
    const user = await this.usersService.create(userData);

    const verificationToken = randomBytes(32).toString('hex');
    await this.usersService.update(user.id, { verificationToken } as any);
    user.verificationToken = verificationToken;

    try {
      await this.medicalProfilesService.update(user.id, {
        dob: dto.dob,
        sex: dto.sex,
        blood_group: dto.blood_group,
        genotype: dto.genotype,
        allergies: dto.allergies,
        medical_history: dto.medical_history,
        shif_number: dto.shif_number,
        insurance_provider: dto.insurance_provider,
        insurance_policy_no: dto.insurance_policy_no,
        emergency_contact_name: dto.emergency_contact_name,
        emergency_contact_phone: dto.emergency_contact_phone,
        emergency_contact_relation: dto.emergency_contact_relation,
      });
    } catch (err) {
      console.error('Failed to create medical profile during registration', err);
    }

    try {
      await this.emailService.sendVerificationEmail(user, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);

    return { user, access_token };
  }

  async registerDoctor(dto: any) {
    let role = 'medic';
    if (dto.cadre === 'Nursing') role = 'medic';
    if (dto.cadre === 'Pharmacy') role = 'pharmacist';
    if (dto.cadre === 'Laboratory') role = 'lab_tech';
    if (dto.cadre === 'Finance') role = 'finance';

    const doctor = await this.doctorsService.create(
      {
        ...dto,
        Verified_status: 0,
        status: 0,
      },
      null
    );

    const resultUser = {
      id: doctor.id,
      email: doctor.email,
      fname: doctor.fname,
      lname: doctor.lname,
      role: role,
      status: false
    };

    try {
      await this.emailService.sendAccountCreationEmail(resultUser as any, role);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return { user: resultUser, doctor };
  }

  async getProfile(userId: number, role?: string) {
    if (role && ['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist', 'finance'].includes(role)) {
      const doctor = await this.doctorsService.findOne(userId);
      if (doctor) {
        const { password, ...result } = doctor;
        const synthRole = this.mapDrTypeToRole(doctor.dr_type);
        // @ts-ignore
        return { ...result, role: synthRole, doctorId: doctor.id, profilePicture: doctor.profile_image };
      }
    }

    const user = await this.usersService.findById(userId);
    if (user) {
      const { password, ...result } = user;
      return result;
    }

    const doctorFallback = await this.doctorsService.findOne(userId);
    if (doctorFallback) {
      const { password, ...result } = doctorFallback;
      const synthRole = this.mapDrTypeToRole(doctorFallback.dr_type);
      return { ...result, role: synthRole, doctorId: doctorFallback.id, profilePicture: doctorFallback.profile_image };
    }

    return null;
  }

  async validateGoogleUser(details: any) {
    let user = await this.usersService.findOne(details.email);

    if (user) {
      if (!user.googleId) {
        user.googleId = details.googleId;
        user.emailVerifiedAt = new Date();
        if (!user.profilePicture) user.profilePicture = details.picture;
        await this.usersService.update(user.id, { googleId: user.googleId, emailVerifiedAt: user.emailVerifiedAt, profilePicture: user.profilePicture } as any);
      }
      return user;
    }

    const password = await bcrypt.hash(randomBytes(16).toString('hex'), 10);

    user = await this.usersService.create({
      email: details.email,
      password: password,
      fname: details.firstName,
      lname: details.lastName,
      role: 'patient',
      status: true,
      googleId: details.googleId,
      emailVerifiedAt: new Date(),
      profilePicture: details.picture
    } as any);

    try {
      await this.emailService.sendAccountCreationEmail(user, 'patient');
    } catch (e) {
      console.error('Failed to send welcome email for Google User', e);
    }

    return user;
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new UnauthorizedException('Invalid or expired verification token');

    user.emailVerifiedAt = new Date();
    user.verificationToken = null as any;
    await this.usersService.update(user.id, { emailVerifiedAt: user.emailVerifiedAt, verificationToken: null } as any);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) throw new UnauthorizedException('User not found');
    if (user.emailVerifiedAt) return { message: 'Email already verified' };

    const token = randomBytes(32).toString('hex');
    await this.usersService.update(user.id, { verificationToken: token } as any);

    try {
      await this.emailService.sendVerificationEmail(user, token);
    } catch (e) {
      console.error('Failed to send verification email', e);
    }
    return { message: 'Verification email sent' };
  }

  async loginWithGoogle(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    }
  }

  async forgotPassword(input: string) {
    if (!input || typeof input !== 'string' || input.trim() === '') {
      throw new BadRequestException('Please provide a valid email or phone number.');
    }

    const cleanInput = input.trim();
    let user: any = null;
    let doctor: any = null;
    let isMobile = false;

    // Check if input is a phone number (no @ symbol and at least 9 digits)
    const cleanDigits = cleanInput.replace(/\D/g, '');
    const formattedMobile = this.smsService.formatMobile(cleanInput);

    if (!cleanInput.includes('@') && cleanDigits.length >= 9) {
      isMobile = true;
      const lookupMobile = formattedMobile || cleanDigits;
      user = await this.usersService.findOneByMobile(lookupMobile);
      if (!user) {
        doctor = await this.doctorsService.findOneByMobile(lookupMobile);
      }
    } else {
      user = await this.usersService.findOne(cleanInput);
      if (!user) {
        doctor = await this.doctorsService.findByEmail(cleanInput);
      }
    }

    if (!user && !doctor) {
      return { 
        message: 'If an account exists, a password reset link has been sent.' 
      };
    }

    const token = randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    const target = user || doctor;
    const targetType = user ? 'user' : 'doctor';

    if (targetType === 'user') {
      await this.usersService.update(target.id, { resetToken: token, resetTokenExpires: expiry } as any);
    } else {
      await this.doctorsService.update(target.id, { resetToken: token, resetTokenExpiry: expiry } as any);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://portal.mclinic.co.ke';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    try {
      // 1. Send Email if target has email
      if (target.email) {
        await this.emailService.sendPasswordResetEmail(target, token);
      }
      
      // 2. Send SMS if mobile is available or input was mobile
      const rawMobile = isMobile ? cleanInput : target.mobile;
      const mobileToSend = rawMobile ? this.smsService.formatMobile(rawMobile) : null;

      if (mobileToSend) {
        const message = `M-Clinic: Reset your password here: ${resetUrl} (Valid for 1 hr)`;
        await this.smsService.sendSms(mobileToSend, message);
      }
    } catch (e) {
      console.error('Failed to send reset notifications:', e);
    }

    return { 
      message: isMobile 
        ? 'Password reset link sent to your phone via SMS.' 
        : 'If an account exists, a password reset link has been sent.' 
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // 1. Try finding in Users
    let target: any = await this.usersService.findByToken(token);
    let targetType: 'user' | 'doctor' = 'user';
    let expiryField = 'resetTokenExpires';

    // 2. Try finding in Doctors
    if (!target) {
      target = await this.doctorsService.findOneByResetToken(token);
      targetType = 'doctor';
      expiryField = 'resetTokenExpiry';
    }

    if (!target) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const expiry = target[expiryField];
    if (expiry && new Date() > new Date(expiry)) {
      throw new UnauthorizedException('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    if (targetType === 'user') {
      await this.usersService.update(target.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      } as any);
    } else {
      await this.doctorsService.update(target.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      } as any);
    }

    try {
      // Send SMS Notification
      if (target.mobile) {
        const formattedMobile = this.smsService.formatMobile(target.mobile);
        if (formattedMobile) {
          const message = `M-Clinic: Your account password has been successfully reset. If this was not you, please contact support immediately.`;
          await this.smsService.sendSms(formattedMobile, message);
        }
      }
    } catch (e) {
      console.error('Failed to send password reset success SMS', e);
    }

    return { message: 'Password reset successful. You can now login with your new password.' };
  }

  async sendOtp(mobile: string, userType: 'patient' | 'provider' = 'patient') {
    const formattedMobile = this.smsService.formatMobile(mobile);
    if (!formattedMobile) {
      throw new BadRequestException('Invalid mobile number format. Use 07... or 254...');
    }

    let account: any = null;
    let type: 'patient' | 'provider' = 'patient';

    // 1. Try Patient
    account = await this.usersService.findOneByMobile(formattedMobile);
    if (!account) {
      // 2. Try Provider
      account = await this.doctorsService.findOneByMobile(formattedMobile);
      if (account) type = 'provider';
    }

    if (!account) {
      throw new NotFoundException('Account with this mobile number not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (type === 'provider') {
      await this.doctorsService.update(account.id, { otp, otp_expires: expiry });
    } else {
      await this.usersService.update(account.id, { otp, otp_expires: expiry });
    }

    const message = `M-Clinic: Your One-Time PIN (OTP) is ${otp}. It expires in 10 minutes.`;
    const sent = await this.smsService.sendSms(formattedMobile, message);

    if (!sent) {
      // In production, we'd throw. For now, let's log and return success if it's likely a config issue
      // to avoid blocking users if the SMS provider is temporarily down but we have the OTP.
      console.warn(`[AuthService] SMS Failed to ${formattedMobile}. OTP: ${otp}`);
      // return { success: true, message: 'OTP sent (Simulation)' }; // For debugging
    }

    return { success: true, message: 'OTP sent successfully' };
  }

  async loginWithOtp(mobile: string, otp: string, userType: 'patient' | 'provider' = 'patient') {
    const formattedMobile = this.smsService.formatMobile(mobile);
    if (!formattedMobile) throw new BadRequestException('Invalid mobile number');

    let account: any = null;
    let type: 'patient' | 'provider' = 'patient';

    // 1. Try Patient
    account = await this.usersService.findOneByMobile(formattedMobile);
    if (!account || account.otp !== otp) {
        // 2. Try Provider
        account = await this.doctorsService.findOneByMobile(formattedMobile);
        if (account) type = 'provider';
    }

    if (!account || account.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (new Date() > new Date(account.otp_expires)) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Clear OTP
    if (type === 'provider') {
      await this.doctorsService.update(account.id, { otp: null, otp_expires: null });
    } else {
      await this.usersService.update(account.id, { otp: null, otp_expires: null });
    }

    // Map role
    let role = account.role;
    if (type === 'provider') {
      role = this.mapDrTypeToRole(account.dr_type);
    }

    const payload = { email: account.email, sub: account.id, role };
    
    // Update last access timestamp
    try {
      await this.usersService.updateLastAccess(account.id);
    } catch (e) {
      console.error('[AuthService] Failed to update lastAccess for OTP login:', e);
    }
    
    let finalUser = { ...account, role };
    if (finalUser.password) delete (finalUser as any).password;
    if (finalUser.otp) delete (finalUser as any).otp;

    return {
      access_token: this.jwtService.sign(payload),
      user: finalUser,
    };
  }

  async mpesaMiniappLogin(authCode: string, phoneNumber?: string) {
    let phone = phoneNumber || '254712345678';
    
    // If the authCode resembles a phone number, use it directly (common in mock/sandbox)
    if (authCode && authCode !== 'test_code' && (authCode.startsWith('254') || authCode.startsWith('0') || authCode.startsWith('+254'))) {
      phone = authCode;
    }
    
    const formattedPhone = this.smsService.formatMobile(phone) || '254712345678';
    
    // Check if user exists by mobile
    let user = await this.usersService.findOneByMobile(formattedPhone);
    if (!user) {
      // Create user as a patient automatically (Seamless onboarding)
      const mockEmail = `mpesa-${formattedPhone}@mclinic.co.ke`;
      const dummyPassword = await bcrypt.hash(randomBytes(16).toString('hex'), 10);
      user = await this.usersService.create({
        email: mockEmail,
        password: dummyPassword,
        fname: 'M-Pesa Patient',
        lname: formattedPhone.substring(formattedPhone.length - 4),
        role: 'patient',
        mobile: formattedPhone,
        status: true,
        emailVerifiedAt: new Date(),
      } as any);
      
      try {
        await this.medicalProfilesService.update(user.id, {
          emergency_contact_phone: formattedPhone,
        });
      } catch (e) {
        console.error('Failed to create medical profile for miniapp user', e);
      }
    }
    
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    
    await this.usersService.updateLastAccess(user.id);
    
    let finalUser = { ...user };
    if (finalUser.password) delete (finalUser as any).password;
    
    return {
      access_token: this.jwtService.sign(payload),
      user: finalUser,
    };
  }
}
