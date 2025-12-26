import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
        user: any;
    }>;
    register(body: any): Promise<import("../users/entities/user.entity").User>;
    registerDoctor(body: any): Promise<{
        user: import("../users/entities/user.entity").User;
        doctor: import("../doctors/entities/doctor.entity").Doctor;
    }>;
}
