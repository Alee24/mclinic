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
    await this.migrateRoles();
  }

  // MIGRATION: Auto-convert old doctor/nurse/clinician roles to 'medic'
  private async migrateRoles() {
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

  async resetPassword(id: number, pass: string): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(pass, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateDto: DeepPartial<User>): Promise<User | null> {
    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }
    await this.usersRepository.update(id, updateDto);
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { verificationToken: token } });
  }

  async findByToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { resetToken: token } });
  }

  async updateByEmail(email: string, updateDto: DeepPartial<User>): Promise<void> {
    if (updateDto.password) {
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
}
