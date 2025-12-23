import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';

@Injectable()
export class MedicalRecordsService {
    constructor(
        @InjectRepository(MedicalRecord)
        private medicalRecordsRepository: Repository<MedicalRecord>,
    ) { }

    async create(createMedicalRecordDto: any): Promise<MedicalRecord> {
        const record = this.medicalRecordsRepository.create(createMedicalRecordDto as unknown as DeepPartial<MedicalRecord>);
        return this.medicalRecordsRepository.save(record);
    }

    async findByPatient(patientId: number): Promise<MedicalRecord[]> {
        return this.medicalRecordsRepository.find({
            where: { patientId },
            relations: ['doctor', 'doctor.user'],
            order: { createdAt: 'DESC' }
        });
    }

    async findOne(id: number): Promise<MedicalRecord | null> {
        return this.medicalRecordsRepository.findOne({ where: { id }, relations: ['patient', 'doctor'] });
    }
}
