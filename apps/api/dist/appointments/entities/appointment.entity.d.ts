import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
export declare enum AppointmentStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Appointment {
    id: number;
    patient: User;
    patientId: number;
    doctor: Doctor;
    doctorId: number;
    serviceId: number;
    appointment_date: Date;
    appointment_time: string;
    fee: number;
    status: AppointmentStatus;
    notes: string;
    meetingLink: string;
    meetingId: string;
    createdAt: Date;
    updatedAt: Date;
}
