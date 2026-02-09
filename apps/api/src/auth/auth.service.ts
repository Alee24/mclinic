import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { MedicalProfilesService } from '../medical-profiles/medical-profiles.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
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
  ) { }

  async validateUser(email: string, pass: string, userType: string = 'patient'): Promise<any> {
    if (userType === 'provider') {
      // 1. Check Doctors table primarily for providers
      const doctor = await this.doctorsService.findByEmail(email);
      if (doctor) {
        if (await bcrypt.compare(pass, doctor.password)) {
          if (!doctor.status || doctor.status === 0) {
            const msg = doctor.approvalStatus === 'pending'
              ? 'Account verification pending. Please wait for approval.'
              : 'Account is suspended or inactive. Contact admin.';
            throw new UnauthorizedException(msg);
          }
          const role = this.mapDrTypeToRole(doctor.dr_type);
          const { password, ...result } = doctor;
          return { ...result, role };
        } else {
          throw new UnauthorizedException('Invalid password. Please try again or reset your password.');
        }
      }

      // 2. Fallback: Check Users table ONLY for 'admin' roles trying to login as provider
      const admin = await this.usersService.findOne(email);
      if (admin && admin.role === UserRole.ADMIN) {
        if (await bcrypt.compare(pass, admin.password)) {
          const { password, ...result } = admin;
          return result;
        } else {
          throw new UnauthorizedException('Invalid admin password.');
        }
      }

      // 3. Soft Detection: Is this a Patient trying to login as Provider?
      const patientInstead = await this.usersService.findOne(email);
      if (patientInstead) {
        throw new UnauthorizedException('This account is registered as a Patient. Please switch to "Patient" login.');
      }
    } else {
      // Patient table (Users)
      const user = await this.usersService.findOne(email);
      if (user) {
        if (await bcrypt.compare(pass, user.password)) {
          const { password, ...result } = user;
          return result;
        } else {
          throw new UnauthorizedException('Invalid password. Please try again.');
        }
      }

      // 3. Soft Detection: Is this a Doctor trying to login as Patient?
      const doctorInstead = await this.doctorsService.findByEmail(email);
      if (doctorInstead) {
        throw new UnauthorizedException('This account is registered as a Healthcare Professional. Please switch to "Provider" login.');
      }
    }

    throw new UnauthorizedException('No account found with this email. Please register to continue.');
  }

  private mapDrTypeToRole(drType: string): string {
    const type = (drType || '').toLowerCase();
    if (type.includes('nurse')) return 'nurse';
    if (type.includes('clinical')) return 'clinician';
    if (type.includes('lab')) return 'lab_tech';
    if (type.includes('pharm')) return 'pharmacist';
    // Removed admin check - admins should be in users table, not doctors table
    return 'doctor';
  }

  async login(loginDto: any, ipAddress?: string, location?: string) {
    const validUser = await this.validateUser(loginDto.email, loginDto.password, loginDto.userType);

    const payload = {
      email: validUser.email,
      sub: validUser.id,
      role: validUser.role,
    };

    // Send login notification email
    try {
      await this.emailService.sendLoginAttemptEmail(
        validUser,
        ipAddress || 'Unknown',
        location || 'Unknown'
      );
    } catch (error) {
      console.error('Failed to send login email:', error);
    }

    // Handle medic vs patient ID consistency for the frontend
    let finalUser = { ...validUser };
    if (['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist'].includes(validUser.role)) {
      // If result came from doctors table, it already has doc details
      // Ensure doctorId is set for frontend compatibility
      // @ts-ignore
      finalUser.doctorId = validUser.id;
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: finalUser,
    };
  }

  async register(dto: any) {
    // 1. Create Patient in Users Table ONLY
    const userData = {
      ...dto,
      role: 'patient',
      status: true
    };
    const user = await this.usersService.create(userData);

    // Generate Verification Token
    const verificationToken = randomBytes(32).toString('hex');
    await this.usersService.update(user.id, { verificationToken } as any);
    user.verificationToken = verificationToken;

    // 2. Create Medical Profile Extension
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

    // 3. Send Verification Email
    try {
      await this.emailService.sendVerificationEmail(user, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    // Generate auto-login token
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

    // 1. Create Doctor Profile ONLY in Doctors Table (Strict Separation)
    const doctor = await this.doctorsService.create(
      {
        ...dto,
        Verified_status: 0,
        status: 0,
        approvalStatus: 'pending',
      },
      null // No linking user object needed in this separate flow
    );

    // Create a dummy user object for JSON response consistency
    const resultUser = {
      id: doctor.id,
      email: doctor.email,
      fname: doctor.fname,
      lname: doctor.lname,
      role: role,
      status: false
    };

    // 2. Send welcome email
    try {
      await this.emailService.sendAccountCreationEmail(resultUser as any, role);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return { user: resultUser, doctor };
  }

  async getProfile(userId: number, role?: string) {
    // If we have a role, we know exactly where to look
    if (role && ['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist', 'finance'].includes(role)) {
      const doctor = await this.doctorsService.findOne(userId);
      if (doctor) {
        const { password, ...result } = doctor;
        const synthRole = this.mapDrTypeToRole(doctor.dr_type);
        // @ts-ignore
        return { ...result, role: synthRole, doctorId: doctor.id, profilePicture: doctor.profile_image };
      }
    }

    // Default to Users table (Patients/Admins)
    const user = await this.usersService.findById(userId);
    if (user) {
      const { password, ...result } = user;
      return result;
    }

    // Final fallback if role was missing but it's a doctor
    const doctorFallback = await this.doctorsService.findOne(userId);
    if (doctorFallback) {
      const { password, ...result } = doctorFallback;
      const synthRole = this.mapDrTypeToRole(doctorFallback.dr_type);
      return { ...result, role: synthRole, doctorId: doctorFallback.id, profilePicture: doctorFallback.profile_image };
    }

    return null;
  }
  async forgotPassword(email: string) {
    const user = await this.usersService.findOne(email);
    if (user) {
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await this.usersService.update(user.id, { resetToken, resetTokenExpiry } as any);
      await this.emailService.sendPasswordResetEmail(user, resetToken);
    }
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPass: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token.');
    }

    if (user.resetTokenExpiry < new Date()) {
      throw new UnauthorizedException('Token expired.');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    } as any);

    return { message: 'Password updated successfully.' };
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

    // Send Email
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
    };
  }
}
