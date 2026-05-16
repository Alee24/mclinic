import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, IsNull, In } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as QRCode from 'qrcode';

import { NckVerificationService } from './nck-verification.service';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

@Injectable()
export class DoctorsService implements OnModuleInit {
    constructor(
        @InjectRepository(Doctor)
        private doctorsRepository: Repository<Doctor>,
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>,
        private usersService: UsersService,
        private emailService: EmailService,
        private nckService: NckVerificationService,
    ) { }

    async getDashboardStats(doctorIdOrUserEmail: any) {
        let doctorId = typeof doctorIdOrUserEmail === 'number' ? doctorIdOrUserEmail : null;

        // If we got an email (from controller), Resolve the doctor
        if (typeof doctorIdOrUserEmail === 'string') {
            const doc = await this.doctorsRepository.findOne({ where: { email: doctorIdOrUserEmail } });
            if (doc) doctorId = Number(doc.id);
        }

        if (!doctorId) {
            return { appointmentsToday: 0, totalPatients: 0, pendingReports: 0 };
        }

        // 1. Today's Appointments
        // IMPORTANT: Use local time date string or adjust for timezone? 
        // For now, consistent with existing logic: YYYY-MM-DD
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const appointmentsToday = await this.appointmentsRepository.createQueryBuilder('appointment')
            .where('appointment.doctorId = :doctorId', { doctorId })
            .andWhere('appointment.appointment_date = :today', { today: todayStr })
            .getCount();

        // 2. Total Patients (Unique)
        const uniquePatients = await this.appointmentsRepository
            .createQueryBuilder('appointment')
            .select('COUNT(DISTINCT appointment.patientId)', 'count')
            .where('appointment.doctorId = :doctorId', { doctorId })
            .getRawOne();
        const totalPatients = parseInt(uniquePatients?.count || '0');

        // 3. Pending Reports (Completed appointments with NO medical record)
        const pendingReports = await this.appointmentsRepository
            .createQueryBuilder('appointment')
            .leftJoin('medical_record', 'mr', 'mr.appointmentId = appointment.id')
            .where('appointment.doctorId = :doctorId', { doctorId })
            .andWhere('appointment.status = :status', { status: 'completed' })
            .andWhere('mr.id IS NULL')
            .getCount();

        return {
            appointmentsToday,
            totalPatients,
            pendingReports
        };
    }

    async onModuleInit() {
        console.log('[DoctorsService] Startup checks bypassed (Strict Separation Active)');
        try {
            await this.ensureColumnsExist();
            // Automatically sync doctors on startup to ensure the table is never empty on a fresh VPS deploy
            await this.syncDoctorsWithUsers();
        } catch (e) {
            console.error('[DoctorsService] Startup checks/sync failed:', e);
        }
    }

    private async ensureColumnsExist() {
        const columns = [
            { name: 'profile_image', definition: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'signatureUrl', definition: 'VARCHAR(255) DEFAULT NULL' },
            { name: 'stampUrl', definition: 'VARCHAR(255) DEFAULT NULL' }
        ];

        for (const col of columns) {
            try {
                const cols = await this.doctorsRepository.query(
                    `SHOW COLUMNS FROM doctors LIKE '${col.name}'`
                );
                if (cols.length === 0) {
                    await this.doctorsRepository.query(
                        `ALTER TABLE doctors ADD COLUMN ${col.name} ${col.definition}`
                    );
                    console.log(`[DoctorsService] ${col.name} column created.`);
                }
            } catch (err) {
                console.error(`[DoctorsService] Could not ensure ${col.name} column:`, err);
            }
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
        return { 
            success: true, 
            message: `Synced ${doctorUsers.length} doctor users.`,
            created: createdCount,
            updated: updatedCount
        };
    }

    private mapRoleToDrType(role: string): string {
        switch (role) {
            case 'doctor': return 'Specialist';
            case 'nurse': return 'Nurse';
            case 'clinician': return 'Clinical Officer';
            case 'lab_tech': return 'Lab Technician';
            case 'pharmacist': return 'Pharmacist';
            case 'admin': return 'Specialist';
            default: return 'Medic';
        }
    }

    async syncDoctorsFromUsers() {
        return this.syncDoctorsWithUsers();
    }

    // NEW: Sync Users FROM Doctors (reverse direction)
    // This ensures that users table has correct roles based on doctors table
    async syncUsersFromDoctors(): Promise<{ success: boolean; message: string; updated: number }> {
        console.log('[DoctorsService] Syncing Users FROM Doctors table (updating user roles)...');
        const allDoctors = await this.doctorsRepository.find();
        let updatedCount = 0;

        for (const doctor of allDoctors) {
            if (!doctor.email) continue;

            const user = await this.usersService.findOne(doctor.email);
            if (!user) {
                console.log(`[DoctorsService] No user found for doctor ${doctor.email}, skipping...`);
                continue;
            }

            // Map doctor type to user role
            const correctRole = this.mapDrTypeToUserRole(doctor.dr_type);

            // PROTECT ADMINS: Never downgrade or change role for an existing admin user
            if (user.role === UserRole.ADMIN) {
                console.log(`[DoctorsService] Protecting admin role for ${doctor.email}, skipping sync.`);
                continue;
            }

            // Only update if role is different
            if ((user.role as string) !== (correctRole as string)) {
                console.log(`[DoctorsService] Updating ${doctor.email}: ${user.role} -> ${correctRole}`);
                await this.usersService.updateByEmail(doctor.email, { role: correctRole });
                updatedCount++;
            }
        }

        return {
            success: true,
            message: `Synced ${allDoctors.length} doctors. Updated ${updatedCount} user roles.`,
            updated: updatedCount
        };
    }

    private mapDrTypeToUserRole(drType: string): UserRole {
        if (!drType) return UserRole.MEDIC;

        const type = drType.toLowerCase();
        if (type.includes('nurse')) return UserRole.NURSE;
        if (type.includes('clinical') || type.includes('clinician')) return UserRole.CLINICIAN;
        if (type.includes('lab') || type.includes('technician')) return UserRole.LAB_TECH;
        if (type.includes('pharmac')) return UserRole.PHARMACIST;
        if (type.includes('admin')) return UserRole.ADMIN;
        if (type.includes('doctor') || type.includes('specialist')) return UserRole.DOCTOR;

        return UserRole.MEDIC; // Default for medical staff
    }

    async create(createDoctorDto: any, user: User | null): Promise<Doctor> {
        return this.createDoctorLogic(createDoctorDto, user);
    }

    private async createDoctorLogic(dto: any, user: User | null) {
        // 1. Hash password if present
        if (dto.password) {
            dto.password = await bcrypt.hash(dto.password, 10);
        }

        // 2. Safety: Filter out fields that don't exist in the database schema to prevent crashes
        // This is crucial because frontend may send UI state fields like 'cadre' or 'confirmPassword'
        const allowedFields = this.doctorsRepository.metadata.columns.map(c => c.propertyName);
        const filteredDto = Object.keys(dto)
            .filter(key => allowedFields.includes(key))
            .reduce((obj: any, key) => {
                obj[key] = dto[key];
                return obj;
            }, {});

        // 3. Create record using filtered data
        const doctor = this.doctorsRepository.create({
            ...filteredDto,
            user_id: user ? user.id : (dto.user_id || null),
            status: 0, // Inactive until verified
            Verified_status: 0,
        } as unknown as DeepPartial<Doctor>);

        try {
            return await this.doctorsRepository.save(doctor);
        } catch (error) {
            console.error('[DoctorsService] Registration Error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                throw new BadRequestException('An account with this email already exists.');
            }
            throw new BadRequestException('Could not complete registration. Please check your details.');
        }
    }

    async getNearby(lat: number, lng: number, radiusKm: number = 50, includeAll: boolean = false, user?: any): Promise<any[]> {
        // Refactored to ensure we catch doctors with missing coordinates and assign them
        // so they show up on the map (Critical for demo/testing).

        const query = this.doctorsRepository.createQueryBuilder('doctor');

        if (!includeAll) {
            query.where('doctor.Verified_status = :verified', { verified: 1 })
                .andWhere('doctor.status = :status', { status: 1 })
                .andWhere('doctor.is_online = :isOnline', { isOnline: 1 });
        }

        const doctors = await query.getMany();
        const results = [];
        const updates = [];

        for (const doc of doctors) {
            // @ts-ignore
            let dLat = Number(doc.latitude);
            // @ts-ignore
            let dLng = Number(doc.longitude);
            let changed = false;

            // FIX: If no location, assign random near the USER'S location (demo mode)
            if (!dLat || !dLng || dLat === 0 || dLng === 0) {
                // Random offset within ~2-5km
                const latOffset = (Math.random() - 0.5) * 0.05;
                const lngOffset = (Math.random() - 0.5) * 0.05;

                dLat = lat + latOffset;
                dLng = lng + lngOffset;

                // Update doctor object
                // @ts-ignore
                doc.latitude = dLat;
                // @ts-ignore
                doc.longitude = dLng;

                changed = true;
            }

            if (changed) {
                updates.push(this.doctorsRepository.save(doc));
            }

            // Calculate Distance (Haversine)
            const R = 6371; // Radius of the earth in km
            const dLatRad = this.deg2rad(dLat - lat);
            const dLngRad = this.deg2rad(dLng - lng);
            const a =
                Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
                Math.cos(this.deg2rad(lat)) * Math.cos(this.deg2rad(dLat)) *
                Math.sin(dLngRad / 2) * Math.sin(dLngRad / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distance in km

            if (distance <= radiusKm) {
                const finalDoc = (user && (user.role === 'admin' || user.role === 'doctor' || await this.hasUserPaidForDoctor(user.sub || user.id, doc.id)))
                    ? doc 
                    : this.maskDoctor(doc);
                results.push({ ...finalDoc, distance });
            }
        }

        // Save generated coordinates in background
        if (updates.length > 0) {
            Promise.all(updates).catch(err => console.error('Error auto-updating doctor locations:', err));
        }

        // Sort by distance
        return results.sort((a, b) => a.distance - b.distance).slice(0, 20);
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    async findAllVerified(search?: string, includeOffline: boolean = true, user?: any): Promise<any[]> {
        const query = this.doctorsRepository.createQueryBuilder('doctor');

        if (includeOffline) {
            // Show all registered medics (even if offline/unverified) as long as they have an email
            query.where('doctor.email IS NOT NULL AND doctor.email != ""');
        } else {
            // Strict mode: Only fully activated and online medics
            query
                .where('doctor.Verified_status = :verified', { verified: 1 })
                .andWhere('doctor.status = :status', { status: 1 })
                .andWhere('doctor.is_online = :isOnline', { isOnline: 1 });
        }

        if (search) {
            query.andWhere(
                '(doctor.fname LIKE :search OR doctor.lname LIKE :search OR doctor.dr_type LIKE :search OR doctor.speciality LIKE :search OR doctor.qualification LIKE :search OR CONCAT(doctor.fname, " ", doctor.lname) LIKE :search)',
                { search: `%${search}%` }
            );
        }

        let activeDocs = await query.getMany();
        const updates = [];

        // Ensure all doctors have coordinates for the map (Nairobi default for demo)
        for (const doc of activeDocs) {
            if (!doc.latitude || !doc.longitude || Number(doc.latitude) === 0) {
                // Random offset near Nairobi center if missing
                const baseLat = -1.2921;
                const baseLng = 36.8219;
                const latOffset = (Math.random() - 0.5) * 0.1;
                const lngOffset = (Math.random() - 0.5) * 0.1;

                doc.latitude = baseLat + latOffset;
                doc.longitude = baseLng + lngOffset;
                
                updates.push(this.doctorsRepository.update(doc.id, { 
                    latitude: doc.latitude, 
                    longitude: doc.longitude 
                }));
            }
        }

        if (updates.length > 0) {
            Promise.all(updates).catch(err => console.error('[DocsService] Failed to auto-assign locations:', err));
        }

        // Handle Privacy Masking
        const results = await Promise.all(activeDocs.map(async (doc) => {
            // If user is Admin/Doctor OR the medic is fully activated/verified, show full details
            if (!user || user.role === 'admin' || user.role === 'doctor' || (doc.status === 1 && doc.Verified_status === 1)) {
                return doc;
            }

            const hasPaid = await this.hasUserPaidForDoctor(user.sub || user.id, doc.id);
            if (hasPaid) return doc;

            // If not paid and NOT fully activated, mask but KEEP the generated coordinates for the map display
            const masked = this.maskDoctor(doc);
            return {
                ...masked,
                latitude: doc.latitude,
                longitude: doc.longitude,
                is_online: doc.is_online // Keep online status for the marker pulse
            };
        }));

        return results;
    }

    async hasUserPaidForDoctor(userId: number, doctorId: number): Promise<boolean> {
        try {
            // Check for confirmed/completed appointments
            const appointment = await this.appointmentsRepository.findOne({
                where: {
                    patientId: userId,
                    doctorId: doctorId,
                    status: In(['confirmed', 'completed'] as any)
                }
            });

            if (appointment) return true;

            // Check for paid invoices linked to this doctor (matching by email if patientId is missing)
            const user = await this.usersService.findById(userId);
            if (!user) return false;

            const paidInvoice = await this.appointmentsRepository.manager.getRepository('Invoice').findOne({
                where: {
                    customerEmail: user.email,
                    doctorId: doctorId,
                    status: In(['paid', 'PAID'] as any)
                }
            });

            return !!paidInvoice;
        } catch (error) {
            console.error('[DoctorsService] hasUserPaidForDoctor check failed:', error.message);
            return false;
        }
    }

    maskDoctor(doctor: Doctor): any {
        const mask = (str: string) => {
            if (!str) return '***';
            if (str.length <= 2) return str[0] + '*';
            return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
        };

        return {
            ...doctor,
            fname: mask(doctor.fname),
            lname: mask(doctor.lname),
            email: 'private@mclinic.co.ke',
            mobile: '+2547***',
            address: 'Private Location',
            latitude: null,
            longitude: null,
            isPrivate: true,
            unlockMessage: 'Book an appointment and complete payment to unlock full medic details.'
        };
    }

    async findAll(drType?: string, verifiedStatus?: string, status?: string): Promise<Doctor[]> {
        const query = this.doctorsRepository.createQueryBuilder('doctor');

        if (drType) {
            query.andWhere('doctor.dr_type = :drType', { drType });
        }

        if (verifiedStatus !== undefined && verifiedStatus !== '') {
            query.andWhere('doctor.Verified_status = :verifiedStatus', { verifiedStatus: parseInt(verifiedStatus) });
        }

        if (status !== undefined && status !== '') {
            query.andWhere('doctor.status = :status', { status: parseInt(status) });
        }

        return query.getMany();
    }

    async findOne(id: number, user?: any): Promise<any | null> {
        const doctor = await this.doctorsRepository.findOne({ where: { id } });
        if (!doctor) return null;

        if (!user || user.role === 'admin' || user.role === 'doctor') {
            return doctor;
        }

        const hasPaid = await this.hasUserPaidForDoctor(user.sub || user.id, doctor.id);
        if (hasPaid) return doctor;

        return this.maskDoctor(doctor);
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

        // Safety: Filter out fields that don't exist in the database schema to prevent crashes
        const allowedFields = this.doctorsRepository.metadata.columns.map(c => c.propertyName);
        const filteredDto = Object.keys(updateDto)
            .filter(key => allowedFields.includes(key))
            .reduce((obj: any, key) => {
                obj[key] = updateDto[key];
                return obj;
            }, {});

        await this.doctorsRepository.update(id, filteredDto);
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
                if (updateDto.password) userUpdate.password = updateDto.password;
                if (updateDto.licenceNo) userUpdate.licenseNumber = updateDto.licenceNo;
                if (updateDto.national_id) userUpdate.national_id = updateDto.national_id;

                await this.usersService.updateByEmail(updatedDoctor.email, userUpdate);
            } catch (err) {
                console.error(`[DocsService] Failed to sync user profile for ${updatedDoctor.email}`, err);
            }
        }

        return updatedDoctor;
    }

    async updateOnlineStatus(id: number, status: number, lat?: number, lng?: number): Promise<Doctor | null> {
        const updates: any = { is_online: status };
        if (lat !== undefined && lng !== undefined) {
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

    async findOneByMobile(mobile: string): Promise<Doctor | null> {
        return this.doctorsRepository.findOne({ where: { mobile } });
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

        doctor.Verified_status = 0;
        doctor.status = 0;

        return this.doctorsRepository.save(doctor);
    }

    async updateStatus(id: number, status: number): Promise<Doctor> {
        const doctor = await this.findOne(id);
        if (!doctor) throw new Error('Doctor not found');

        doctor.status = status;
        return this.doctorsRepository.save(doctor);
    }

    async findPendingDoctors(): Promise<Doctor[]> {
        return await this.doctorsRepository.find({
            where: { Verified_status: 0 },
            order: { created_at: 'DESC' },
        });
    }

    async generateIdCard(id: number) {
        const doctor = await this.findOne(id);
        if (!doctor) throw new NotFoundException('Doctor not found');

        const paddedId = id.toString().padStart(3, '0');
        const serialNumber = `MCK-${new Date().getFullYear()}-${paddedId}`;
        const frontendUrl = process.env.FRONTEND_URL || 'https://portal.mclinic.co.ke';
        const verificationUrl = `${frontendUrl}/verify/doctor/${doctor.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

        return {
            success: true,
            serialNumber,
            doctor: {
                name: `${doctor.fname} ${doctor.lname}`,
                email: doctor.email,
                mobile: doctor.mobile,
                speciality: doctor.dr_type || 'Medic',
                licenseNumber: doctor.licenceNo,
                licenseExpiry: doctor.updated_at, // Using updated_at as a placeholder if expiry is missing
                drType: doctor.dr_type,
                profileImage: doctor.profile_image?.startsWith('http') ? doctor.profile_image : (doctor.profile_image ? `/api/uploads/profiles/${doctor.profile_image}` : null),
            },
            qrCode: qrCodeDataUrl,
            issuedDate: new Date().toISOString(),
            verificationUrl,
        };
    }

    async processCsvUpload(buffer: Buffer): Promise<{ success: boolean; count: number; errors: string[] }> {
        const content = buffer.toString('utf-8');
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) throw new Error('CSV is empty or missing headers');

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
        const createdDocs = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                const docData: any = {};
                headers.forEach((h, idx) => { docData[h] = values[idx]; });

                if (!docData.email || !docData.fname) {
                    errors.push(`Line ${i + 1}: Missing email or first name`);
                    continue;
                }

                const doctorPayload = {
                    ...docData,
                    licenceNo: docData.licenceno || docData.licensenumber,
                    dr_type: docData.dr_type || 'Medic',
                    password: docData.password || 'Mclinic@2025',
                    status: docData.status ? parseInt(docData.status) : 1,
                    Verified_status: docData.verified_status ? parseInt(docData.verified_status) : 1,
                };

                const newDoc = await this.create(doctorPayload, null);
                createdDocs.push(newDoc);
            } catch (err) {
                errors.push(`Line ${i + 1}: ${err.message}`);
            }
        }
        return { success: true, count: createdDocs.length, errors };
    }

    async verifyByLicense(licenceNo: string): Promise<any> {
        return this.nckService.verifyNurse(licenceNo);
    }

    async verifyAndUpdateMedic(id: number): Promise<any> {
        const doc = await this.findOne(id);
        if (!doc) throw new NotFoundException('Medic not found');
        const cleanLicense = doc.licenceNo?.trim();
        if (!cleanLicense) throw new BadRequestException('License number missing or invalid');

        const result = await this.nckService.verifyNurse(cleanLicense);

        const updateData: any = {
            Verified_status: result.success && result.status === 'Active' ? 1 : 0,
            status: result.success && result.status === 'Active' ? 1 : 0,
        };

        // Set can_prescribe based on dr_type
        const prescribableRoles = ['Clinical Officer', 'Specialist', 'Doctor'];
        if (prescribableRoles.includes(doc.dr_type)) {
            updateData.can_prescribe = 1;
        } else {
            updateData.can_prescribe = 0;
        }

        if (result.success) {
            // Record exists - User wants them activated
            updateData.status = 1; // Active
            updateData.approvalStatus = 'approved';
            updateData.rejectionReason = result.status !== 'Active' ? `Note: NCK Status is ${result.status}` : null;
            updateData.Verified_status = 1;
            updateData.licenseStatus = result.status?.toLowerCase() === 'active' ? 'valid' : 'expired';

            // Auto-update Qualifications if found
            if (result.qualifications) {
                updateData.qualification = result.qualifications;
            }

            // Auto-update Profile Picture if found
            if (result.imageUrl && result.imageUrl.startsWith('http')) {
                try {
                    const localPath = await this.downloadProfileImage(result.imageUrl, id);
                    if (localPath) {
                        updateData.profile_image = localPath;
                    }
                } catch (e) {
                    console.error('Failed to process NCK image', e);
                    updateData.profile_image = result.imageUrl;
                }
            }

            // Auto-update Name if found
            if (result.name) {
                const { fname, lname } = this.parseNckName(result.name);
                updateData.fname = fname;
                updateData.lname = lname;
            }

            await this.doctorsRepository.update(id, updateData);

            // Sync with User account if exists (Very important for login consistency)
            const updatedDoc = await this.findOne(id);
            if (updatedDoc && updatedDoc.email) {
                try {
                    await this.usersService.syncUserFromDoctor(updatedDoc);
                } catch (syncErr) {
                    console.error(`[DoctorsService] Failed to sync user for verified medic ${updatedDoc.email}`, syncErr);
                }
            }

            return { success: true, medic: updatedDoc, nck: result };
        } else {
            await this.doctorsRepository.update(id, updateData);
            return { success: false, message: 'NCK verification failed or inactive.' };
        }
    }

    async verifyAllNurses(): Promise<{ success: boolean; count: number; updated: number; current_total: number }> {
        const doctors = await this.doctorsRepository.find({
            where: [
                { dr_type: 'Nurse', Verified_status: 0 },
                { dr_type: 'Medic', Verified_status: 0 }
            ],
            take: 20
        });

        const totalToVerify = await this.doctorsRepository.count({
            where: { Verified_status: 0 }
        });

        let updated = 0;
        for (const doc of doctors) {
            if (doc.licenceNo && doc.licenceNo.length > 3) {
                try {
                    // Call the main verification method which now contains all logic (activation, name sync, image sync)
                    const res = await this.verifyAndUpdateMedic(doc.id);
                    if (res && res.success) {
                        updated++;
                    }
                } catch (e) {
                    console.error(`Failed to verify ${doc.email}: ${e.message}`);
                }
            }
        }

        return {
            success: true,
            count: doctors.length,
            updated,
            current_total: totalToVerify
        };
    }



    async bulkSuspend(ids: number[], reason: string): Promise<any> {
        if (!ids.length) return { count: 0 };
        return this.doctorsRepository.update(ids, {
            status: 0,
            Verified_status: 0,
            approvalStatus: 'pending',
            rejectionReason: reason
        });
    }

    async bulkActivate(ids: number[]): Promise<any> {
        if (!ids.length) return { count: 0 };
        return this.doctorsRepository.update(ids, {
            status: 1,
            approvalStatus: 'approved',
            rejectionReason: null as any
        });
    }

    async bulkOnlineStatus(status: number): Promise<any> {
        await this.doctorsRepository.createQueryBuilder()
            .update(Doctor)
            .set({ is_online: status })
            .where('1 = 1')
            .execute();
        
        return { success: true, count: await this.doctorsRepository.count() };
    }

    /**
     * Approve all pending medics and simultaneously sync users from the users table
     * into the doctors table if they don't exist yet. This is the master fix for
     * the "no medics showing" issue after a fresh VPS deploy.
     */
    async approveAll(): Promise<{ count: number; synced: number }> {
        try {
            // 1. Sync: create doctor records for any medic-role users without a doctor record
            const syncResult = await this.syncDoctorsWithUsers();

            // 2. Activate ALL doctors on the system using a direct query for maximum reliability
            await this.doctorsRepository.createQueryBuilder()
                .update(Doctor)
                .set({
                    status: 1,
                    Verified_status: 1,
                    approvalStatus: 'approved',
                    rejectionReason: null,
                    can_prescribe: 1
                } as any)
                .where('1 = 1')
                .execute();

            const count = await this.doctorsRepository.count();
            return { count, synced: syncResult.created || 0 };
        } catch (error) {
            console.error('[DoctorsService] approveAll failed:', error);
            throw error;
        }
    }

    private async downloadProfileImage(url: string, doctorId: number): Promise<string | null> {
        try {
            const destDir = path.join(__dirname, '..', '..', 'uploads', 'profiles');
            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            const filename = `nck-${doctorId}-${Date.now()}.jpg`;
            const destPath = path.join(destDir, filename);

            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                }
            });

            const writer = fs.createWriteStream(destPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(filename));
                writer.on('error', reject);
            });
        } catch (error) {
            console.error('[DoctorsService] Error downloading NCK profile image:', error.message);
            return null;
        }
    }

    private parseNckName(fullName: string): { fname: string; lname: string } {
        if (!fullName) return { fname: '', lname: '' };

        const parts = fullName.trim().split(/\s+/);
        const fname = parts[0] || 'Medical';
        const lname = parts.slice(1).join(' ') || 'Professional';
        return { fname, lname };
    }

    /**
     * SYNC SINGLE DOCTOR TO USER (Restored for Build)
     * Ensuring that every doctor found during login has a corresponding entry in the 'users' table.
     */
    async syncSingleDoctorToUser(email: string): Promise<User | null> {
        const doctor = await this.doctorsRepository.findOne({ where: { email } });
        if (!doctor) return null;

        let user = await this.usersService.findOne(email);
        const drRole = this.mapDrTypeToUserRole(doctor.dr_type);

        const userData: any = {
            email: doctor.email,
            password: doctor.password,
            fname: doctor.fname,
            lname: doctor.lname,
            mobile: doctor.mobile,
            role: drRole,
            status: true,
            emailVerifiedAt: new Date(),
            profilePicture: doctor.profile_image
        };

        if (user) {
            await this.usersService.update(user.id, userData);
            return this.usersService.findById(user.id);
        } else {
            return this.usersService.create(userData);
        }
    }
    async findOneByResetToken(token: string): Promise<Doctor | null> {
        return this.doctorsRepository.findOne({ where: { resetToken: token } });
    }
}
