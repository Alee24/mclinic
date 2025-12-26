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
    wallets: Wallet[];
    createdAt: Date;
    updatedAt: Date;
}
