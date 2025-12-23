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
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
