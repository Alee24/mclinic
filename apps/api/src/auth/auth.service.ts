import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private doctorsService: DoctorsService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const validUser = await this.validateUser(user.email, user.password);
        if (!validUser) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: validUser.email, sub: validUser.id, role: validUser.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: validUser,
        };
    }

    async register(createUserDto: any) {
        return this.usersService.create(createUserDto);
    }

    async registerDoctor(dto: any) {
        // 1. Create User (Inactive)
        const user = await this.usersService.create({
            email: dto.email,
            password: dto.password,
            fname: dto.fname,
            lname: dto.lname,
            role: 'doctor', // Type correction might be needed depending on interface
            status: false // Inactive until approved
        } as any);

        // 2. Create Doctor Profile (Pending)
        const doctor = await this.doctorsService.create({
            ...dto,
            Verified_status: 0
        }, null);

        return { user, doctor };
    }
}
