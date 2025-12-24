import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Service } from '../services/entities/service.entity';
import { Invoice } from '../financial/entities/invoice.entity';
export declare class AppointmentsService {
    private appointmentsRepository;
    private servicesRepository;
    private invoiceRepository;
    constructor(appointmentsRepository: Repository<Appointment>, servicesRepository: Repository<Service>, invoiceRepository: Repository<Invoice>);
    create(createAppointmentDto: any): Promise<Appointment>;
    findAll(): Promise<Appointment[]>;
    findByPatient(patientId: number): Promise<Appointment[]>;
    findByDoctor(doctorId: number): Promise<Appointment[]>;
    updateStatus(id: number, status: AppointmentStatus): Promise<Appointment | null>;
}
