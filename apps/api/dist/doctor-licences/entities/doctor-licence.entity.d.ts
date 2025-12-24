import { Doctor } from '../../doctors/entities/doctor.entity';
export declare class DoctorLicence {
    id: number;
    doctor_id: number;
    doctor: Doctor;
    licence_no: string;
    expiry_date: Date;
    document: string;
    verified: boolean;
}
