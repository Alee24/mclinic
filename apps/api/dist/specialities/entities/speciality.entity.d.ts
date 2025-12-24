import { Doctor } from '../../doctors/entities/doctor.entity';
export declare class Speciality {
    id: number;
    name: string;
    description: string;
    doctors: Doctor[];
}
