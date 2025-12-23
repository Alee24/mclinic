import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
export declare class MedicalRecord {
    id: number;
    patient: Patient;
    patientId: number;
    doctor: Doctor;
    doctorId: number;
    diagnosis: string;
    prescription: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
