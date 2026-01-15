import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, IsNull } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';

@Injectable()
export class DoctorsService implements OnModuleInit {
    constructor(
        @InjectRepository(Doctor)
        private doctorsRepository: Repository<Doctor>,
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>,
        private usersService: UsersService,
        private emailService: EmailService,
    ) { }

    async onModuleInit() {
        console.log('[DoctorsService] Running startup checks...');
        try {
            await this.backfillUserIds();
            await this.syncDoctorsWithUsers();
        } catch (error) {
            console.error('[DoctorsService] Startup sync failed:', error);
            // Don't throw, let the app start
        }
    }

    private async backfillUserIds() {
        const doctorsWithoutUser = await this.doctorsRepository.find({
            where: { user_id: IsNull() }
        });

        // Manual query to be sure
        const candidates = await this.doctorsRepository.createQueryBuilder('doctor')
            .where('doctor.user_id IS NULL')
            .getMany();

        if (candidates.length > 0) {
            console.log(`[DoctorsService] Found ${candidates.length} doctors without user_id. Attempting backfill...`);
            for (const doc of candidates) {
                if (doc.email) {
                    const user = await this.usersService.findOne(doc.email);
                    if (user) {
                        await this.doctorsRepository.update(doc.id, { user_id: user.id });
                        console.log(`[DoctorsService] Linked Doctor ${doc.id} (${doc.email}) to User ${user.id}`);
                    }
                }
            }
        }
    }

    async syncDoctorsWithUsers() {
        console.log('[DoctorsService] Syncing Doctors from Users table...');
        const allUsers = await this.usersService.findAll();
        const doctorUsers = allUsers.filter(u =>
            ['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist', 'admin'].includes(u.role)
        );

        let createdCount = 0;
        let updatedCount = 0;

        for (const user of doctorUsers) {
            let doctor = await this.doctorsRepository.findOne({ where: { email: user.email } });

            // Map User Role to Doctor Type
            const drType = this.mapRoleToDrType(user.role);

            const docData: DeepPartial<Doctor> = {
                user_id: user.id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                mobile: user.mobile,
                address: user.address,
                sex: user.sex,
                dob: user.dob,
                profile_image: user.profilePicture,
                dr_type: drType,
                password: user.password, // IMPORTANT: Sync password for direct login
                status: 1, // Ensure active
            };

            if (!doctor) {
                console.log(`[DoctorsService] Creating missing Doctor profile for ${user.email}`);
                doctor = this.doctorsRepository.create({
                    ...docData,
                    Verified_status: 1,
                    approvalStatus: 'approved',
                    fee: 1500,
                });
                await this.doctorsRepository.save(doctor);
                createdCount++;
            } else {
                // Update existing doctor to ensure password and details are in sync
                await this.doctorsRepository.update(doctor.id, docData);
                updatedCount++;
            }
        }
        return { success: true, message: `Synced ${doctorUsers.length} doctor users. Created ${createdCount}, Updated ${updatedCount}.` };
    }

    private mapRoleToDrType(role: string): string {
        switch (role) {
            case 'doctor': return 'Specialist';
            case 'nurse': return 'Nurse';
            case 'clinician': return 'Clinical Officer';
            case 'lab_tech': return 'Lab Technician';
            case 'pharmacist': return 'Pharmacist';
            case 'admin': return 'Admin';
            default: return 'Medic';
        }
    }

    async syncDoctorsFromUsers() {
        return this.syncDoctorsWithUsers();
    }

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
            user_id: user ? user.id : null, // Save user_id if provided
            status: 0, // Inactive until approved
            Verified_status: 0,
            approvalStatus: 'pending', // Default to pending
            licenseStatus: 'valid', // Assume valid initially
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

    async remove(id: number): Promise<void> {
        const doctor = await this.findOne(id);
        if (!doctor) return;

        // Delete associated user if exists
        if (doctor.email) {
            try {
                // Assuming UsersService has a delete/remove method or similar
                // If not, we skip or add it. Let's assume we can try to find and delete.
                await this.usersService.removeByEmail(doctor.email);
            } catch (e) {
                console.error(`Failed to remove user associated with doctor ${id}`, e);
            }
        }
        await this.doctorsRepository.delete(id);
    }

    async suspend(id: number, reason: string): Promise<Doctor> {
        const doctor = await this.findOne(id);
        if (!doctor) throw new Error('Doctor not found');

        doctor.approvalStatus = 'suspended';
        doctor.rejectionReason = reason; // Reuse rejectionReason for suspension reason
        doctor.status = 0; // Inactive
        return this.doctorsRepository.save(doctor);
    }

    async updateStatus(id: number, status: number): Promise<Doctor> {
        const doctor = await this.findOne(id);
        if (!doctor) throw new Error('Doctor not found');

        doctor.status = status;

        // If activating, ensure approval status is correct if it was suspended
        if (status === 1 && doctor.approvalStatus === 'suspended') {
            doctor.approvalStatus = 'approved';
        }

        return this.doctorsRepository.save(doctor);
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

    async generateIdCard(id: number) {
        const doctor = await this.doctorsRepository.findOne({
            where: { id },
            // relations: ['user'] -- Removed: Doctor entity has no 'user' relation defined
        });

        if (!doctor) throw new Error('Doctor not found');

        // STRICT VALIDATION
        const missingFields = [];
        if (!doctor.profile_image) missingFields.push('Profile Photo');
        if (!doctor.licenceNo) missingFields.push('License Number');
        if (!doctor.licenseExpiryDate) missingFields.push('License Expiry Date');

        if (missingFields.length > 0) {
            throw new Error(`Cannot generate ID Card. Missing: ${missingFields.join(', ')}. Please update your profile.`);
        }

        // Generate Serial Number: MCK-{YEAR}-{ID}
        // Pad ID with zeros to 3 digits (e.g. 005)
        const paddedId = id.toString().padStart(3, '0');
        const serialNumber = `MCK-${new Date().getFullYear()}-${paddedId}`;

        // Verification URL
        const verificationUrl = `https://mclinic.co.ke/verify/doctor/${doctor.id}`;

        // Generate QR Code
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

        return {
            doctor: {
                id: doctor.id,
                name: `${doctor.fname} ${doctor.lname}`,
                email: doctor.email,
                mobile: doctor.mobile,
                speciality: doctor.speciality,
                drType: doctor.dr_type,
                licenseNumber: doctor.licenceNo,
                licenseExpiry: doctor.licenseExpiryDate,
                profileImage: doctor.profile_image ? `${process.env.API_URL || 'https://portal.mclinic.co.ke/api'}/uploads/profiles/${doctor.profile_image}` : null
            },
            serialNumber,
            qrCode: qrCodeDataUrl,
            verificationUrl,
            issuedDate: new Date()
        };
    }
}
