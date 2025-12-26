import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
export declare class Review {
    id: number;
    rating: number;
    comment: string;
    patient: User;
    patientId: number;
    doctor: Doctor;
    doctorId: number;
    appointment: Appointment;
    appointmentId: number;
    createdAt: Date;
}
