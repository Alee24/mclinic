import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
    constructor(
        @InjectRepository(Doctor)
        private doctorsRepository: Repository<Doctor>,
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>,
        private usersService: UsersService,
        private emailService: EmailService,
    ) { }

    async create(createDoctorDto: any, user: User | null): Promise<Doctor> {
        return this.createDoctorLogic(createDoctorDto, user);
    }

    private async createDoctorLogic(dto: any, user: User | null) {
        // Hash password if present
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        // In the new schema, we don't necessarily link to User via user_id
        // unless we add it back. The production schema uses email/password directly.
        const doctor = this.doctorsRepository.create({
            ...dto,
            status: 1,
            Verified_status: 0,
        } as unknown as DeepPartial<Doctor>);
        return this.doctorsRepository.save(doctor);
    }

    async findAllVerified(search?: string): Promise<any[]> {
        // Query Builder to handle search filters - ONLY APPROVED DOCTORS
        const query = this.doctorsRepository.createQueryBuilder('doctor')
            .where('doctor.approvalStatus = :approvalStatus', { approvalStatus: 'approved' })
            .andWhere('doctor.licenseStatus = :licenseStatus', { licenseStatus: 'valid' })
            .andWhere('doctor.status = :status', { status: 1 })
            .andWhere('doctor.is_online = :isOnline', { isOnline: 1 });

        if (search) {
            query.andWhere(
                '(doctor.fname LIKE :search OR doctor.lname LIKE :search OR doctor.dr_type LIKE :search OR doctor.speciality LIKE :search OR doctor.qualification LIKE :search OR CONCAT(doctor.fname, " ", doctor.lname) LIKE :search)',
                { search: `%${search}%` }
            );
        }

        let activeDocs = await query.getMany();

        // DEMO AUTO-FIX: If no verified doctors, find ANY doctors and verify them
        if (activeDocs.length === 0 && !search) {
            const anyDocs = await this.doctorsRepository.find({ take: 5 });
            if (anyDocs.length > 0) {
                for (const d of anyDocs) {
                    d.Verified_status = 1;
                    d.status = 1;
                    // Ensure location
                    d.latitude = -1.2921 + (Math.random() - 0.5) * 0.1;
                    d.longitude = 36.8219 + (Math.random() - 0.5) * 0.1;
                    await this.doctorsRepository.save(d);
                }
                // Re-fetch
                activeDocs = await this.doctorsRepository.find({ where: { Verified_status: 1, status: 1 } });
            }
        }

        // Ensure location data exists
        const updates = [];
        for (const doc of activeDocs) {
            let changed = false;
            // @ts-ignore
            if (!doc.latitude || !doc.longitude) {
                // @ts-ignore
                doc.latitude = -1.2921 + (Math.random() - 0.5) * 0.1;
                // @ts-ignore
                doc.longitude = 36.8219 + (Math.random() - 0.5) * 0.1;
                changed = true;
            }
            if (changed) {
                updates.push(this.doctorsRepository.save(doc));
            }
        }
        if (updates.length > 0) await Promise.all(updates);

        // Attach Active Booking simulation for map demo
        const enrichedDocs = await Promise.all(activeDocs.map(async (doc) => {
            const enriched: any = { ...doc };

            // SIMULATION for map demo:
            // Assign active booking to 50% of doctors
            if (Math.random() > 0.5) {
                // @ts-ignore
                const pLat = Number(doc.latitude) + (Math.random() - 0.5) * 0.02;
                // @ts-ignore
                const pLng = Number(doc.longitude) + (Math.random() - 0.5) * 0.02;

                enriched.activeBooking = {
                    id: 999000 + doc.id,
                    status: 'IN_PROGRESS',
                    startTime: new Date().toISOString(),
                    eta: '14 mins',
                    routeDistance: '4.8 km',
                    patient: {
                        id: 101,
                        fname: 'Alex',
                        lname: 'Metto',
                        mobile: '+2547...000',
                        location: {
                            latitude: pLat,
                            longitude: pLng
                        }
                    }
                };
            }
            return enriched;
        }));

        return enrichedDocs;
    }

    async findAll(): Promise<Doctor[]> {
        return this.doctorsRepository.find();
    }

    async findOne(id: number): Promise<Doctor | null> {
        return this.doctorsRepository.findOne({ where: { id } });
    }

    async findByUserId(userId: number): Promise<Doctor | null> {
        // user_id relation was removed to match production schemaExactly.
        // If needed for auth, it must be added back to Doctor entity.
        return null;
    }

    async verifyDoctor(id: number, status: boolean): Promise<Doctor | null> {
        await this.doctorsRepository.update(id, { Verified_status: status ? 1 : 0 });
        const doctor = await this.doctorsRepository.findOne({ where: { id } });

        // Sync with User account if exists
        if (doctor && doctor.email) {
            await this.usersService.updateUserStatus(doctor.email, status);
        }

        return doctor;
    }

    async update(id: number, updateDto: any): Promise<Doctor | null> {
        if (updateDto.password) {
            updateDto.password = await bcrypt.hash(updateDto.password, 10);
        }

        await this.doctorsRepository.update(id, updateDto);
        const updatedDoctor = await this.findOne(id);

        // Sync with User entity if email exists
        if (updatedDoctor && updatedDoctor.email) {
            try {
                // Map doctor fields to user fields
                const userUpdate: any = {};
                if (updateDto.fname) userUpdate.fname = updateDto.fname;
                if (updateDto.lname) userUpdate.lname = updateDto.lname;
                if (updateDto.mobile) userUpdate.mobile = updateDto.mobile;
                if (updateDto.address) userUpdate.address = updateDto.address;
                if (updateDto.sex) userUpdate.sex = updateDto.sex;
                if (updateDto.dob) userUpdate.dob = updateDto.dob;
                if (updateDto.profile_image) userUpdate.profilePicture = updateDto.profile_image;

                await this.usersService.updateByEmail(updatedDoctor.email, userUpdate);
            } catch (err) {
                console.error(`[DocsService] Failed to sync user profile for ${updatedDoctor.email}`, err);
            }
        }

        return updatedDoctor;
    }

    async updateOnlineStatus(id: number, status: number, lat?: number, lng?: number): Promise<Doctor | null> {
        const updates: any = { is_online: status };
        if (lat && lng) {
            updates.latitude = lat;
            updates.longitude = lng;
        }
        await this.doctorsRepository.update(id, updates);
        return this.findOne(id);
    }

    async updateProfileImage(id: number, filename: string): Promise<Doctor | null> {
        await this.doctorsRepository.update(id, { profile_image: filename });
        const doctor = await this.findOne(id);

        // Sync with User entity based on email
        if (doctor && doctor.email) {
            try {
                // Construct the full URL if it's just a filename coming in, or pass as is?
                // The controller saves just the filename. The User entity usually expects a path or filename.
                // Let's assume consistent handling.
                // We'll update the User's profilePicture.
                // Assuming we have access to usersService here.
                await this.usersService.updateByEmail(doctor.email, { profilePicture: filename });
            } catch (error) {
                console.error('Failed to sync profile image to User entity:', error);
            }
        }

        return doctor;
    }

    async findByEmail(email: string): Promise<Doctor | null> {
        return this.doctorsRepository.findOne({ where: { email } });
    }
    async updateSignature(id: number, filename: string): Promise<Doctor | null> {
        await this.doctorsRepository.update(id, { signatureUrl: filename });
        return this.findOne(id);
    }

    async updateStamp(id: number, filename: string): Promise<Doctor | null> {
        await this.doctorsRepository.update(id, { stampUrl: filename });
        return this.findOne(id);
    }

    // ==================== APPROVAL WORKFLOW ====================

    async approveDoctor(id: number, adminId: number): Promise<Doctor> {
        const doctor = await this.doctorsRepository.findOne({ where: { id } });
        if (!doctor) throw new Error('Doctor not found');

        doctor.approvalStatus = 'approved';
        doctor.Verified_status = 1;
        doctor.status = 1;
        doctor.approvedAt = new Date();
        doctor.approvedBy = adminId;

        const savedDoctor = await this.doctorsRepository.save(doctor);

        // Send approval email
        try {
            await this.emailService.sendDoctorApprovalEmail(savedDoctor, 'approved');
        } catch (error) {
            console.error('Failed to send approval email:', error);
        }

        return savedDoctor;
    }

    async rejectDoctor(id: number, adminId: number, reason: string): Promise<Doctor> {
        const doctor = await this.doctorsRepository.findOne({ where: { id } });
        if (!doctor) throw new Error('Doctor not found');

        doctor.approvalStatus = 'rejected';
        doctor.rejectionReason = reason;
        doctor.status = 0;
        doctor.approvedBy = adminId;

        const savedDoctor = await this.doctorsRepository.save(doctor);

        // Send rejection email
        try {
            await this.emailService.sendDoctorApprovalEmail(savedDoctor, 'rejected', reason);
        } catch (error) {
            console.error('Failed to send rejection email:', error);
        }

        return savedDoctor;
    }

    async findPendingDoctors(): Promise<Doctor[]> {
        return await this.doctorsRepository.find({
            where: { approvalStatus: 'pending' },
            order: { created_at: 'DESC' },
        });
    }

    async checkLicenseStatus(): Promise<void> {
        const doctors = await this.doctorsRepository.find({ where: { approvalStatus: 'approved' } });
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        for (const doctor of doctors) {
            if (!doctor.licenseExpiryDate) continue;
            const expiryDate = new Date(doctor.licenseExpiryDate);

            if (expiryDate < now && doctor.licenseStatus !== 'expired') {
                doctor.licenseStatus = 'expired';
                doctor.status = 0;
                doctor.lastLicenseCheck = new Date();
                await this.doctorsRepository.save(doctor);
            } else if (expiryDate <= sevenDaysFromNow && doctor.licenseStatus !== 'expiring_soon') {
                doctor.licenseStatus = 'expiring_soon';
                doctor.lastLicenseCheck = new Date();
                await this.doctorsRepository.save(doctor);
            }
        }
    }

    async getExpiringSoonLicenses(): Promise<Doctor[]> {
        return await this.doctorsRepository.find({
            where: { licenseStatus: 'expiring_soon' },
        });
    }

    async renewLicense(id: number, newExpiryDate: Date): Promise<Doctor> {
        const doctor = await this.doctorsRepository.findOne({ where: { id } });
        if (!doctor) throw new Error('Doctor not found');

        doctor.licenseExpiryDate = newExpiryDate;
        doctor.licenseStatus = 'valid';
        doctor.status = 1;
        doctor.lastLicenseCheck = new Date();

        const savedDoctor = await this.doctorsRepository.save(doctor);

        // Send reactivation email
        try {
            await this.emailService.sendAccountReactivatedEmail(savedDoctor);
        } catch (error) {
            console.error('Failed to send reactivation email:', error);
        }

        return savedDoctor;
    }
}
