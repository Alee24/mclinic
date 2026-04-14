import { Injectable, ConflictException, OnModuleInit, NotFoundException } from '@nestjs/common';
import { In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { NotificationService } from '../notification/notification.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationService: NotificationService
  ) { }

  async onModuleInit() {
    try {
      await this.migrateRoles();
    } catch (e) {
      console.error('[UsersService] onModuleInit migration failed:', e);
    }
  }

  // MIGRATION: Auto-convert old doctor/nurse/clinician roles to 'medic'
  private async migrateRoles() {
    try {
      console.log('[UsersService] Checking for roles to migrate to "medic"...');
      const candidates = await this.usersRepository.find({
        where: { role: In([UserRole.DOCTOR, UserRole.NURSE, UserRole.CLINICIAN]) }
      });

      if (candidates.length > 0) {
        console.log(`[UsersService] Found ${candidates.length} users with legacy roles. Migrating to 'medic'...`);
        for (const user of candidates) {
          user.role = UserRole.MEDIC;
          await this.usersRepository.save(user);
        }
        console.log('[UsersService] Migration complete.');
      }
    } catch (e) {
      console.error('[UsersService] migrateRoles failed (likely schema mismatch):', e);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    let hashedPassword = createUserDto.password;
    if (!this.isBcryptHash(hashedPassword)) {
      hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    }
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // Notify Admin
    try {
      if (this.notificationService) {
        await this.notificationService.notifyAdmin(
          'signup',
          `New User Signup: ${savedUser.fname} ${savedUser.lname} (${savedUser.email})`
        );
      }
    } catch (e) {
      console.error('Failed to notify admin of signup', e);
    }

    return savedUser;
  }

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneByMobile(mobile: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { mobile } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async countActive(): Promise<number> {
    return this.usersRepository.count({ where: { status: true } });
  }

  async updateUserStatus(email: string, status: boolean): Promise<void> {
    await this.usersRepository.update({ email }, { status });
  }

  async resetAllPasswords(pass: string, adminId: number): Promise<{ success: boolean; count: number }> {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const result = await this.usersRepository.update({}, { password: hashedPassword });
    return { success: true, count: result.affected || 0 };
  }

  async resetPassword(id: number, pass: string): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    user.password = await bcrypt.hash(pass, 10);
    return this.usersRepository.save(user);
  }

  async update(id: number, updateDto: DeepPartial<User>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    if (updateDto.password && typeof updateDto.password === 'string' && !this.isBcryptHash(updateDto.password)) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    Object.assign(user, updateDto);
    return this.usersRepository.save(user);
  }

  async updateProfilePicture(id: number, filename: string): Promise<User | null> {
    await this.usersRepository.update(id, { profilePicture: filename });
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async requestDeletion(id: number, password: string): Promise<any> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ConflictException('Invalid password');

    await this.usersRepository.update(id, {
      deletionRequestedAt: new Date(),
      deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return { success: true, message: 'Account deletion requested.' };
  }

  async cancelDeletion(id: number): Promise<any> {
    await this.usersRepository.update(id, {
      deletionRequestedAt: null,
      deletionScheduledAt: null
    });
    return { success: true, message: 'Account deletion cancelled.' };
  }

  private isBcryptHash(str: string): boolean {
    return /^\$2[ab]\$[0-9]{2}\$[./0-9A-Za-z]{53}$/.test(str);
  }

  async getDeletionStatus(id: number): Promise<any> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return {
      requested: !!user.deletionRequestedAt,
      requestedAt: user.deletionRequestedAt,
      scheduledAt: user.deletionScheduledAt
    };
  }

  async syncUserFromDoctor(doctor: any): Promise<User | null> {
    const email = doctor.email;
    if (!email) return null;

    let user = await this.findOne(email);
    const userData: DeepPartial<User> = {
      email: doctor.email,
      password: doctor.password, // Sync password
      fname: doctor.fname,
      lname: doctor.lname,
      mobile: doctor.mobile,
      role: doctor.dr_type ? this.mapDrTypeToUserRole(doctor.dr_type) : UserRole.MEDIC,
      status: true,
      profilePicture: doctor.profile_image
    };

    if (user) {
      await this.usersRepository.update(user.id, userData);
      return this.usersRepository.findOne({ where: { id: user.id } });
    } else {
      const newUser = this.usersRepository.create(userData);
      return this.usersRepository.save(newUser);
    }
  }

  private mapDrTypeToUserRole(drType: string): UserRole {
    if (!drType) return UserRole.MEDIC;
    const type = drType.toLowerCase();
    if (type.includes('nurse')) return UserRole.NURSE;
    if (type.includes('clinical') || type.includes('clinician')) return UserRole.CLINICIAN;
    if (type.includes('lab') || type.includes('technician')) return UserRole.LAB_TECH;
    if (type.includes('pharmac')) return UserRole.PHARMACIST;
    if (type.includes('admin')) return UserRole.ADMIN;
    if (type.includes('doctor') || type.includes('specialist')) return UserRole.DOCTOR;
    return UserRole.MEDIC;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { verificationToken: token } });
  }

  async findByToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }

  async updateByEmail(email: string, updateDto: DeepPartial<User>): Promise<void> {
    if (updateDto.password && typeof updateDto.password === 'string' && !this.isBcryptHash(updateDto.password)) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }
    await this.usersRepository.update({ email }, updateDto);
  }

  async removeByEmail(email: string): Promise<void> {
    await this.usersRepository.delete({ email });
  }

  async findAllByMobile(mobile: string): Promise<User[]> {
      return this.usersRepository.find({ where: { mobile } });
  }

  async findPublicProfile(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'fname', 'lname', 'role', 'email', 'profilePicture', 'licenseNumber', 'specialization', 'bio', 'status', 'isPublic']
    });

    if (!user) {
      throw new NotFoundException('Medic profile not found');
    }
    
    if (!user.isPublic) {
      throw new ConflictException('This profile is not currently public');
    }

    return user;
  }

  async togglePublic(id: number, isPublic: boolean) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    
    await this.usersRepository.update(id, { isPublic });
    return this.findById(id);
  }
}
