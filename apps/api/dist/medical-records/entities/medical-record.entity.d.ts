import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
export declare class MedicalRecord {
    id: number;
    patient: User;
    patientId: number;
    doctor: Doctor;
    doctorId: number;
    appointment: Appointment;
    appointmentId: number;
    diagnosis: string;
    prescription: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
