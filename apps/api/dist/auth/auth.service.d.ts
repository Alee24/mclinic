import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private doctorsService;
    private jwtService;
    constructor(usersService: UsersService, doctorsService: DoctorsService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(createUserDto: any): Promise<import("../users/entities/user.entity").User>;
    registerDoctor(dto: any): Promise<{
        user: import("../users/entities/user.entity").User;
        doctor: import("../doctors/entities/doctor.entity").Doctor;
    }>;
}
