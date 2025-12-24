import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Transaction } from '../financial/entities/transaction.entity';
import { ServicePrice } from '../financial/entities/service-price.entity';
import { Invoice } from '../financial/entities/invoice.entity';
import { InvoiceItem } from '../financial/entities/invoice-item.entity';
export declare class SeedingService {
    private userRepo;
    private patientRepo;
    private doctorRepo;
    private appointmentRepo;
    private recordRepo;
    private txRepo;
    private priceRepo;
    private invoiceRepo;
    private itemRepo;
    constructor(userRepo: Repository<User>, patientRepo: Repository<Patient>, doctorRepo: Repository<Doctor>, appointmentRepo: Repository<Appointment>, recordRepo: Repository<MedicalRecord>, txRepo: Repository<Transaction>, priceRepo: Repository<ServicePrice>, invoiceRepo: Repository<Invoice>, itemRepo: Repository<InvoiceItem>);
    seedAll(): Promise<{
        message: string;
        counts: {
            patients: number;
            doctors: number;
            appointments: number;
            records: number;
            transactions: number;
        };
    }>;
}
