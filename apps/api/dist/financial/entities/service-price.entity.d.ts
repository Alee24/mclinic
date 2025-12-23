import { Doctor } from '../../doctors/entities/doctor.entity';
export declare class ServicePrice {
    id: number;
    serviceName: string;
    amount: number;
    currency: string;
    doctorId: number;
    doctor: Doctor;
    createdAt: Date;
    updatedAt: Date;
}
