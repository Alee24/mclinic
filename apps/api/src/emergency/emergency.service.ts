import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyAlert } from './entities/emergency-alert.entity';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class EmergencyService {
    constructor(
        @InjectRepository(EmergencyAlert)
        private emergencyRepository: Repository<EmergencyAlert>,
    ) { }

    async create(medicId: number | null, latitude: number, longitude: number, notes?: string) {
        const alert = this.emergencyRepository.create({
            medic: medicId ? ({ id: medicId } as any) : undefined,
            latitude,
            longitude,
            status: 'active',
            notes: notes || undefined,
        });
        // Here you would trigger WebSocket / SMS to admin
        console.log(`[Urgent] Panic Alert: ${notes || `Medic ${medicId}`} at ${latitude}, ${longitude}`);
        return this.emergencyRepository.save(alert);
    }

    async updateAudio(id: number, filename: string) {
        await this.emergencyRepository.update(id, { audioUrl: filename });
        return this.emergencyRepository.findOne({ where: { id } });
    }

    async resolve(id: number, notes: string) {
        await this.emergencyRepository.update(id, { status: 'resolved', notes });
        return this.emergencyRepository.findOne({ where: { id } });
    }

    async findAllActive() {
        const alerts = await this.emergencyRepository.find({ where: { status: 'active' }, relations: ['medic'] });
        const enrichedAlerts = [];

        for (const alert of alerts) {
            const match = alert.notes?.match(/User #(\d+)/);
            if (match) {
                const userId = parseInt(match[1], 10);
                try {
                    const patient = await this.emergencyRepository.manager
                        .getRepository(Patient)
                        .findOne({
                            where: { user_id: userId },
                            relations: ['user']
                        });
                    if (patient) {
                            (alert as any).patient = {
                                id: patient.id,
                                fname: patient.fname,
                                lname: patient.lname,
                                mobile: patient.mobile,
                                email: patient.user?.email || '',
                                dob: patient.dob,
                                sex: patient.sex,
                                blood_group: patient.blood_group,
                                allergies: patient.allergies,
                                medical_history: patient.medical_history,
                                emergency_contact_name: patient.emergency_contact_name,
                                emergency_contact_phone: patient.emergency_contact_phone,
                                emergency_contact_relation: patient.emergency_contact_relation
                            };
                    }
                } catch (e) {
                    console.error(`Failed to load patient for emergency user ID ${userId}`, e);
                }
            }
            enrichedAlerts.push(alert);
        }

        return enrichedAlerts;
    }
}
