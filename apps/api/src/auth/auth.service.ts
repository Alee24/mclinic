import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

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
    private dataSource: DataSource,
  ) { }

  /**
   * THE ULTIMATE USER RESOLVER (Re-Applied after Revert)
   * Guaranteed to pick users from the 'users' table using multiple columns and raw SQL fallbacks.
   */
  async validateUser(identifier: string, pass: string, userType: string = 'patient'): Promise<any> {
    const cleanId = (identifier || '').trim();
    const lowerId = cleanId.toLowerCase();
    const isEmail = lowerId.includes('@');

    console.log(`[AuthLookup] Forced Search for: ${cleanId} (${isEmail ? 'Email' : 'Mobile'})`);

    // 1. ATTEMPT SERVICE LOOKUP (Cleanest way)
    let user: any = null;
    let doctor: any = null;

    if (isEmail) {
      user = await this.usersService.findOne(lowerId);
      doctor = await this.doctorsService.findByEmail(lowerId);
    } else {
      user = await this.usersService.findOneByMobile(cleanId);
      doctor = await this.doctorsService.findOneByMobile(cleanId);
    }

    // 2. ATTEMPT DATA SOURCE BRUTE FORCE (Bypass any caching or repository naming issues)
    if (!user) {
      const qUsers = isEmail ? 
        'SELECT * FROM users WHERE LOWER(TRIM(email)) = ? OR email = ? LIMIT 1' : 
        'SELECT * FROM users WHERE mobile = ? OR TRIM(mobile) = ? LIMIT 1';
      const results = await this.dataSource.query(qUsers, [lowerId, cleanId]);
      if (results && results.length > 0) user = results[0];
    }

    if (!doctor) {
      const qDocs = isEmail ? 
        'SELECT * FROM doctors WHERE LOWER(TRIM(email)) = ? OR email = ? LIMIT 1' : 
        'SELECT * FROM doctors WHERE mobile = ? OR TRIM(mobile) = ? LIMIT 1';
      const results = await this.dataSource.query(qDocs, [lowerId, cleanId]);
      if (results && results.length > 0) doctor = results[0];
    }

    // 3. ACCOUNT EXISTENCE CHECK
    if (!user && !doctor) {
       throw new UnauthorizedException(`Login failed: No account linked to "${identifier}" found in system records. Please register to continue.`);
    }

    // 4. AUTHENTICATION (PASSWORD CHECK)
    let authenticated = false;

    // Strategy A: Check Users table (Preferred Source of Truth)
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      authenticated = true;
    } 
    // Strategy B: Check Doctors table (Backup for legacy records)
    else if (doctor && doctor.password && await bcrypt.compare(pass, doctor.password)) {
      authenticated = true;
      if (!user) {
        // Auto-heal by creating the missing users table record now
        user = await this.doctorsService.syncSingleDoctorToUser(doctor.email || identifier);
      } else {
        // Sync password to users table
        await this.usersService.update(user.id, { password: doctor.password });
      }
    }

    if (!authenticated) {
      throw new UnauthorizedException('Login failed: Invalid password. Please try again.');
    }

    // 5. ACCOUNT STATUS & ROLE ENFORCEMENT
    if (user && !user.status && (!doctor || doctor.Verified_status !== 1)) {
        throw new UnauthorizedException('Account access is suspended or restricted. Contact support.');
    }

    const professionalRoles = ['doctor', 'nurse', 'clinician', 'lab_tech', 'pharmacist', 'medic', 'finance', 'admin'];
    
    // Auto-fix roles if mismatch for provider portal
    if (userType === 'provider' && !professionalRoles.includes(user.role)) {
       if (doctor) {
         const correctRole = this.mapDrTypeToRole(doctor.dr_type);
         await this.usersService.update(user.id, { role: correctRole as any });
         user.role = correctRole;
       } else {
         throw new UnauthorizedException('This account is registered for Patients. Please use the Patient login portal.');
       }
    }

    const { password: _, ...result } = user as any;
    if (doctor) result.doctorId = doctor.id;
    return result;
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
    const payload = { email: validUser.email, sub: validUser.id, role: validUser.role };

    try {
      await this.usersService.update(validUser.id, { lastAccess: new Date() } as any);
      if (validUser.doctorId) await this.doctorsService.update(validUser.doctorId, { lastAccess: new Date() } as any);
    } catch (e) {}

    return { access_token: this.jwtService.sign(payload), user: validUser };
  }

  async register(dto: any) {
    const user = await this.usersService.create({ ...dto, role: 'patient', status: true });
    const token = randomBytes(32).toString('hex');
    await this.usersService.update(user.id, { verificationToken: token } as any);
    try { await this.medicalProfilesService.update(user.id, { dob: dto.dob, sex: dto.sex }); } catch (e) {}
    try { await this.emailService.sendVerificationEmail(user, token); } catch (e) {}
    return { user, access_token: this.jwtService.sign({ email: user.email, sub: user.id, role: user.role }) };
  }

  async registerDoctor(dto: any) {
    const role = this.mapDrTypeToRole(dto.dr_type || dto.cadre || 'Medic');
    let user = await this.usersService.findOne(dto.email);
    if (!user) user = await this.usersService.create({ ...dto, role: role as any, status: false });
    const doctor = await this.doctorsService.create({ ...dto, user_id: user.id, status: 0 }, user);
    try { await this.emailService.sendAccountCreationEmail(user, role); } catch (e) {}
    return { user, doctor };
  }

  async getProfile(userId: number, role?: string) {
    const user = await this.usersService.findById(userId);
    if (!user) return null;
    const { password, ...result } = user;
    const doc = await this.doctorsService.findByUserId(userId);
    if (doc) return { ...doc, ...result, doctorId: doc.id };
    return result;
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new UnauthorizedException('Invalid verification token');
    await this.usersService.update(user.id, { emailVerifiedAt: new Date(), verificationToken: null } as any);
    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findOne(email);
    if (!user) throw new NotFoundException('User not found');
    const token = randomBytes(32).toString('hex');
    await this.usersService.update(user.id, { verificationToken: token } as any);
    await this.emailService.sendVerificationEmail(user, token);
    return { message: 'Verification email sent' };
  }
}
