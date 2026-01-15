import { Injectable, ConflictException, OnModuleInit } from '@nestjs/common';
import { In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async onModuleInit() {
    await this.migrateRoles();
  }

  // MIGRATION: Auto-convert old doctor/nurse/clinician roles to 'medic'
  private async migrateRoles() {
    console.log('[UsersService] Checking for roles to migrate to "medic"...');
    // We want to find anyone who Is NOT 'medic', 'patient', 'admin', 'lab_tech' 
    // OR specifically is 'doctor', 'nurse', 'clinician'.
    // Let's be specific to avoid accidents.
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
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
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

  async resetPassword(id: number, pass: string): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(pass, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
    return this.usersRepository.findOne({ where: { id } });
  }
  async update(id: number, updateUserDto: any): Promise<User> {
    await this.usersRepository.update(id, updateUserDto);
    // @ts-ignore
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateByEmail(email: string, updateUserDto: any): Promise<User | null> {
    await this.usersRepository.update({ email }, updateUserDto);
    return this.usersRepository.findOne({ where: { email } });
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async removeByEmail(email: string): Promise<void> {
    await this.usersRepository.delete({ email });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }

  async updateProfilePicture(id: number, filename: string): Promise<User> {
    await this.usersRepository.update(id, { profilePicture: filename });
    // @ts-ignore
    return this.usersRepository.findOne({ where: { id } });
  }
  async requestDeletion(id: number, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    user.deletionRequestedAt = new Date();
    // Schedule for 7 days later
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 7);
    user.deletionScheduledAt = scheduledDate;

    return this.usersRepository.save(user);
  }

  async cancelDeletion(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    user.deletionRequestedAt = null;
    user.deletionScheduledAt = null;

    return this.usersRepository.save(user);
  }

  async getDeletionStatus(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    const isRequested = !!user.deletionRequestedAt;
    const daysRemaining = isRequested && user.deletionScheduledAt
      ? Math.ceil((user.deletionScheduledAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      hasPendingDeletion: isRequested,
      requestedAt: user.deletionRequestedAt,
      scheduledFor: user.deletionScheduledAt,
      daysRemaining
    };
  }
}
