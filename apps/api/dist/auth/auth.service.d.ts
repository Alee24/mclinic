import { UsersService } from '../users/users.service';
import { DoctorsService } from '../doctors/doctors.service';
import { MedicalProfilesService } from '../medical-profiles/medical-profiles.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';
export declare class AuthService {
    private usersService;
    private doctorsService;
    private medicalProfilesService;
    private jwtService;
    private emailService;
    constructor(usersService: UsersService, doctorsService: DoctorsService, medicalProfilesService: MedicalProfilesService, jwtService: JwtService, emailService: EmailService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any, ipAddress?: string, location?: string): Promise<{
        access_token: string;
        user: any;
    }>;
    register(dto: any): Promise<import("../users/entities/user.entity").User>;
    registerDoctor(dto: any): Promise<{
        user: import("../users/entities/user.entity").User;
        doctor: import("../doctors/entities/doctor.entity").Doctor;
    }>;
    getProfile(userId: number): Promise<{
        id: number;
        email: string;
        role: import("../users/entities/user.entity").UserRole;
        status: boolean;
        emailVerifiedAt: Date;
        fname: string;
        lname: string;
        mobile: string;
        national_id: string;
        dob: string;
        sex: string;
        address: string;
        city: string;
        latitude: number;
        longitude: number;
        profilePicture: string;
        wallets: import("../wallets/entities/wallet.entity").Wallet[];
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
