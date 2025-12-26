import { User } from '../../users/entities/user.entity';
export declare class MedicalProfile {
    id: number;
    user_id: number;
    user: User;
    blood_group: string;
    genotype: string;
    height: number;
    weight: number;
    allergies: string;
    medical_history: string;
    social_history: string;
    family_history: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relation: string;
    insurance_provider: string;
    insurance_policy_no: string;
    shif_number: string;
    subscription_plan: string;
    current_medications: string;
    surgical_history: string;
    disability_status: string;
    created_at: Date;
    updated_at: Date;
}
