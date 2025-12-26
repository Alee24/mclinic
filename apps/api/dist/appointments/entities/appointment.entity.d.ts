import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Review } from '../../reviews/entities/review.entity';
export declare enum AppointmentStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    MISSED = "missed",
    RESCHEDULED = "rescheduled"
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
    transportFee: number;
    status: AppointmentStatus;
    notes: string;
    meetingLink: string;
    meetingId: string;
    reason: string;
    isForSelf: boolean;
    beneficiaryName: string;
    beneficiaryGender: string;
    beneficiaryAge: string;
    beneficiaryRelation: string;
    activeMedications: string;
    currentPrescriptions: string;
    homeAddress: string;
    review: Review;
    createdAt: Date;
    updatedAt: Date;
}
