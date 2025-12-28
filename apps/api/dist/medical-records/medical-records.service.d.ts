import { Repository } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
export declare class MedicalRecordsService {
    private medicalRecordsRepository;
    constructor(medicalRecordsRepository: Repository<MedicalRecord>);
    create(createMedicalRecordDto: any): Promise<MedicalRecord>;
    findByPatient(patientId: number): Promise<MedicalRecord[]>;
    findByAppointment(appointmentId: number): Promise<MedicalRecord[]>;
    findOne(id: number): Promise<MedicalRecord | null>;
}
