import { User } from '../../users/entities/user.entity';
export declare class Patient {
    id: number;
    user: User;
    userId: number;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    phoneNumber: string;
    bloodType: string;
    address: string;
    city: string;
    maritalStatus: string;
    occupation: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyContactRelation: string;
    allergies: string;
    existingConditions: string;
    createdAt: Date;
    updatedAt: Date;
}
