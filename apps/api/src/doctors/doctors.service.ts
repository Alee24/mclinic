import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Doctor, VerificationStatus } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DoctorsService {
    constructor(
        @InjectRepository(Doctor)
        private doctorsRepository: Repository<Doctor>,
    ) { }

    async create(createDoctorDto: any, user: User): Promise<Doctor> {
        // Auto-check ACTIVE status based on license date
        const isActive = createDoctorDto.licenseExpiryDate ? new Date(createDoctorDto.licenseExpiryDate) > new Date() : true;

        const doctor = this.doctorsRepository.create({
            ...createDoctorDto,
            isActive,
            verificationStatus: isActive ? VerificationStatus.PENDING : VerificationStatus.REJECTED, // Auto-reject if expired on creation? Or just inactive.
            // user, // Do not link Admin user to the doctor profile
            // userId: user.id,
        } as unknown as DeepPartial<Doctor>);
        return this.doctorsRepository.save(doctor);
    }

    private async checkAndExpireLicenses(doctors: Doctor[]) {
        const now = new Date();
        const updates = [];
        for (const doc of doctors) {
            if (doc.isActive && doc.licenseExpiryDate && new Date(doc.licenseExpiryDate) < now) {
                doc.isActive = false;
                doc.verificationStatus = VerificationStatus.REJECTED; // Or a new status EXPIRED if enum supports it, utilizing REJECTED for now or keep VERIFIED but inactive.
                // Let's toggle isActive.
                updates.push(this.doctorsRepository.save(doc));
            }
        }
        await Promise.all(updates);
    }

    async findAllVerified(): Promise<Doctor[]> {
        // Check integrity active doctors before returning
        // In a real active system, use a CRON. Here we use lazy loading check.
        const activeDocs = await this.doctorsRepository.find({ where: { verificationStatus: VerificationStatus.VERIFIED, isActive: true } });
        await this.checkAndExpireLicenses(activeDocs);
        // Re-fetch to get updated status
        return this.doctorsRepository.find({ where: { verificationStatus: VerificationStatus.VERIFIED, isActive: true } });
    }

    async findAll(): Promise<Doctor[]> {
        const allDocs = await this.doctorsRepository.find({ relations: ['user'] });
        await this.checkAndExpireLicenses(allDocs);
        return this.doctorsRepository.find({ relations: ['user'] });
    }

    async findOne(id: number): Promise<Doctor | null> {
        const doc = await this.doctorsRepository.findOne({ where: { id }, relations: ['user'] });
        if (doc) await this.checkAndExpireLicenses([doc]);
        return this.doctorsRepository.findOne({ where: { id }, relations: ['user'] });
    }

    async findByUserId(userId: number): Promise<Doctor | null> {
        return this.doctorsRepository.findOne({ where: { userId }, relations: ['user'] });
    }

    async verifyDoctor(id: number, status: VerificationStatus): Promise<Doctor | null> {
        await this.doctorsRepository.update(id, { verificationStatus: status });
        return this.doctorsRepository.findOne({ where: { id } });
    }
}
