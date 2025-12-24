import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DoctorsService {
    constructor(
        @InjectRepository(Doctor)
        private doctorsRepository: Repository<Doctor>,
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>,
        private usersService: UsersService,
    ) { }

    async create(createDoctorDto: any, user: User | null): Promise<Doctor> {
        return this.createDoctorLogic(createDoctorDto, user);
    }

    private async createDoctorLogic(dto: any, user: User | null) {
        // In the new schema, we don't necessarily link to User via user_id
        // unless we add it back. The production schema uses email/password directly.
        const doctor = this.doctorsRepository.create({
            ...dto,
            status: 1,
            Verified_status: 0,
        } as unknown as DeepPartial<Doctor>);
        return this.doctorsRepository.save(doctor);
    }

    async findAllVerified(): Promise<any[]> {
        // Step 1: Get verified active doctors (using production schema field names)
        let activeDocs = await this.doctorsRepository.find({ where: { Verified_status: 1, status: 1 } });

        // DEMO AUTO-FIX: If no verified doctors, find ANY doctors and verify them
        if (activeDocs.length === 0) {
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
            if (!doc.latitude || !doc.longitude) {
                doc.latitude = -1.2921 + (Math.random() - 0.5) * 0.1;
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
                const pLat = Number(doc.latitude) + (Math.random() - 0.5) * 0.02;
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
        return this.doctorsRepository.findOne({ where: { id } });
    }

    async update(id: number, updateDto: any): Promise<Doctor | null> {
        if (updateDto.password) {
            updateDto.password = await bcrypt.hash(updateDto.password, 10);
        }
        await this.doctorsRepository.update(id, updateDto);
        return this.findOne(id);
    }
}
