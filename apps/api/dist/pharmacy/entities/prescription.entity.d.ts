import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { PrescriptionItem } from './prescription-item.entity';
export declare enum PrescriptionStatus {
    PENDING = "pending",
    ORDERED = "ordered",
    DISPENSED = "dispensed",
    CANCELLED = "cancelled"
}
export declare class Prescription {
    id: number;
    appointment: Appointment;
    appointmentId: number;
    doctor: Doctor;
    doctorId: number;
    doctorSignatureUrl: string;
    doctorStampUrl: string;
    patient: User;
    patientId: number;
    items: PrescriptionItem[];
    status: PrescriptionStatus;
    notes: string;
    validUntil: Date;
    createdAt: Date;
    updatedAt: Date;
}
