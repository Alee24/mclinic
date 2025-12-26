import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
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

    async remove(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }
}
