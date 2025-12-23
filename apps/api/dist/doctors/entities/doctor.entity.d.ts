import { User } from '../../users/entities/user.entity';
export declare enum VerificationStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    REJECTED = "rejected"
}
export declare class Doctor {
    id: number;
    user: User;
    userId: number;
    name: string;
    specialty: string;
    licenseNumber: string;
    verificationStatus: VerificationStatus;
    boardNumber: string;
    qualifications: string;
    licenseExpiryDate: Date;
    isActive: boolean;
    bio: string;
    hospitalAffiliation: string;
    createdAt: Date;
    updatedAt: Date;
}
