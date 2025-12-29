import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { MedicalProfilesService } from '../medical-profiles/medical-profiles.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private doctorsService: DoctorsService,
    private medicalProfilesService: MedicalProfilesService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, ipAddress?: string, location?: string) {
    const validUser = await this.validateUser(user.email, user.password);
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

    return {
      access_token: this.jwtService.sign(payload),
      user: validUser,
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
    let role = 'doctor';
    if (dto.cadre === 'Nursing') role = 'nurse';
    if (dto.cadre === 'Clinical Officers') role = 'clinician';

    // 1. Create User (Inactive)
    // Consolidate all medical roles to 'medic' as per new architecture
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      fname: dto.fname,
      lname: dto.lname,
      role: 'medic', // Unified role
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
      return result;
    }
    return null;
  }
}
