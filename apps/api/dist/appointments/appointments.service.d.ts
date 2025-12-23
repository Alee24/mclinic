import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
export declare class AppointmentsService {
    private appointmentsRepository;
    constructor(appointmentsRepository: Repository<Appointment>);
    create(createAppointmentDto: any): Promise<Appointment>;
    findAll(): Promise<Appointment[]>;
    findByPatient(patientId: number): Promise<Appointment[]>;
    findByDoctor(doctorId: number): Promise<Appointment[]>;
    updateStatus(id: number, status: AppointmentStatus): Promise<Appointment | null>;
}
