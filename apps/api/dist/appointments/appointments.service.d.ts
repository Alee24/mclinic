import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Service } from '../services/entities/service.entity';
import { Invoice } from '../financial/entities/invoice.entity';
import { FinancialService } from '../financial/financial.service';
import { EmailService } from '../email/email.service';
export declare class AppointmentsService {
    private appointmentsRepository;
    private servicesRepository;
    private invoiceRepository;
    private financialService;
    private emailService;
    constructor(appointmentsRepository: Repository<Appointment>, servicesRepository: Repository<Service>, invoiceRepository: Repository<Invoice>, financialService: FinancialService, emailService: EmailService);
    create(createAppointmentDto: any): Promise<Appointment>;
    findAll(): Promise<Appointment[]>;
    findByPatient(patientId: number): Promise<Appointment[]>;
    findByDoctor(doctorId: number): Promise<Appointment[]>;
    findAllForUser(user: any): Promise<Appointment[]>;
    findOne(id: number): Promise<Appointment | null>;
    updateStatus(id: number, status: AppointmentStatus): Promise<Appointment | null>;
    private calculateDistance;
    reschedule(id: number, date: string, time: string): Promise<Appointment>;
}
