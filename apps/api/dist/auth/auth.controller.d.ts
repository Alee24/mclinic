import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
        user: any;
    }>;
    getProfile(req: any): Promise<{
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
    register(body: any): Promise<import("../users/entities/user.entity").User>;
    registerDoctor(body: any): Promise<{
        user: import("../users/entities/user.entity").User;
        doctor: import("../doctors/entities/doctor.entity").Doctor;
    }>;
}
