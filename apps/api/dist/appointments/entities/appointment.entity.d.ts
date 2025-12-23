import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
export declare enum AppointmentStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Appointment {
    id: number;
    patient: Patient;
    patientId: number;
    doctor: Doctor;
    doctorId: number;
    dateTime: Date;
    status: AppointmentStatus;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
