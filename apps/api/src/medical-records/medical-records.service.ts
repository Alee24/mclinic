import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { MedicalRecord } from './entities/medical-record.entity';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordsRepository: Repository<MedicalRecord>,
  ) { }

  async create(createMedicalRecordDto: any): Promise<MedicalRecord> {
    console.log('[MED_REC_SVC] Creating record for User ID:', createMedicalRecordDto.patientId);

    // We now assume patientId IS the User ID.
    const record = this.medicalRecordsRepository.create({
      ...createMedicalRecordDto,
      patientId: createMedicalRecordDto.patientId
    } as unknown as DeepPartial<MedicalRecord>);

    try {
      return await this.medicalRecordsRepository.save(record);
    } catch (error) {
      console.error('[MED_REC_SVC] Error saving record:', error);
      throw error;
    }
  }

  async findByPatient(patientId: number): Promise<MedicalRecord[]> {
    return this.medicalRecordsRepository.find({
      where: { patientId }, // Now matches User ID directly
      relations: ['doctor', 'doctor.user', 'appointment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<MedicalRecord | null> {
    return this.medicalRecordsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
  }
}
