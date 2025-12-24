import { Wallet } from '../../wallets/entities/wallet.entity';
export declare enum UserRole {
    PATIENT = "patient",
    DOCTOR = "doctor",
    ADMIN = "admin"
}
export declare class User {
    id: number;
    email: string;
    password: string;
    role: UserRole;
    status: boolean;
    emailVerifiedAt: Date;
    wallets: Wallet[];
    createdAt: Date;
    updatedAt: Date;
}
