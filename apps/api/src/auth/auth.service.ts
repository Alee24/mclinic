import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    let user: any = null;

    if (userType === 'provider') {
      user = await this.doctorsService.findByEmail(email);
      if (user && (await bcrypt.compare(pass, user.password))) {
        // Map Doctor entity to a User-like object with a role
        const role = this.mapDrTypeToRole(user.dr_type);
        const { password, ...result } = user;
        return { ...result, role };
      }
    } else {
      user = await this.usersService.findOne(email);
      if (user && (await bcrypt.compare(pass, user.password))) {
        const { password, ...result } = user;
        return result;
      }
    }

    return null;
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
    if (!validUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
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

    // Attach doctorId if medical user
    let finalUser = { ...validUser };
    if (['doctor', 'medic', 'nurse', 'clinician'].includes(validUser.role)) {
      const doctor = await this.doctorsService.findByEmail(validUser.email);
      if (doctor) {
        // @ts-ignore
        finalUser.doctorId = doctor.id;
      }
    }

    return {
      access_token: this.jwtService.sign(payload),
      user: finalUser,
    };
  }

  async register(dto: any) {
    // 1. Create User
    const user = await this.usersService.create(dto);

    // 2. Create Medical Profile if role is patient
    if (user.role === 'patient') {
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
    }

    // 3. Send welcome email
    try {
      await this.emailService.sendAccountCreationEmail(user, user.role);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return user;
  }

  async registerDoctor(dto: any) {
    let role = 'medic'; // Default consolidated role for Doctors, Clinical Officers, etc.
    if (dto.cadre === 'Nursing') role = 'medic'; // Nurses are also Medics/Providers
    if (dto.cadre === 'Pharmacy') role = 'pharmacist';
    if (dto.cadre === 'Laboratory') role = 'lab_tech';
    if (dto.cadre === 'Finance') role = 'finance';

    // 1. Create User (Inactive)
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      fname: dto.fname,
      lname: dto.lname,
      role: role,
      status: false, // Inactive until approved
    } as any);

    // 2. Create Doctor Profile (Pending)
    const doctor = await this.doctorsService.create(
      {
        ...dto,
        Verified_status: 0,
      },
      user, // Pass the created user object which contains the ID
    );

    // 3. Send welcome email
    try {
      await this.emailService.sendAccountCreationEmail(user, role);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    return { user, doctor };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (user) {
      const { password, ...result } = user;

      // Attach doctorId if medical user
      if (['doctor', 'medic', 'nurse', 'clinician'].includes(user.role)) {
        const doctor = await this.doctorsService.findByEmail(user.email);
        if (doctor) {
          // @ts-ignore
          return { ...result, doctorId: doctor.id };
        }
      }

      return result;
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
}
