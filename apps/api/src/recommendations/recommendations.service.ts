import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentRecommendation, RecommendationStatus } from './entities/appointment-recommendation.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class RecommendationsService {
    constructor(
        @InjectRepository(AppointmentRecommendation)
        private recommendationRepo: Repository<AppointmentRecommendation>,
        @InjectRepository(Service)
        private serviceRepo: Repository<Service>,
    ) { }

    async create(data: any) {
        const payload = {
            ...data,
            appointment: { id: data.appointment_id },
            service: data.service_id ? { id: data.service_id } : null
        };
        const rec = this.recommendationRepo.create(payload);
        return this.recommendationRepo.save(rec);
    }

    async findByAppointment(appointmentId: number) {
        return this.recommendationRepo.find({
            where: { appointment: { id: appointmentId } }, // Safe query by relation
            relations: ['service', 'appointment'],
            order: { createdAt: 'DESC' }
        });
    }

    async updateStatus(id: number, status: RecommendationStatus) {
        await this.recommendationRepo.update(id, { status });
        return this.recommendationRepo.findOne({ where: { id }, relations: ['service'] });
    }

    async seedServices() {
        const services = [
            { name: 'Virtual Consultation Session', price: 1500, description: 'Follow-up virtual meeting', duration: 30 },
            { name: 'Emergency Evacuation (Ambulance)', price: 5000, description: 'Emergency transport service', duration: 60 },
            { name: 'Drug Administration', price: 500, description: 'Injection or medication administration', duration: 15 },
            { name: 'General Follow-Up Visit', price: 1000, description: 'Routine check-up', duration: 30 },
            { name: 'Home Care Visit', price: 3000, description: 'Medic visit to patient home', duration: 60 },
        ];

        for (const s of services) {
            const exists = await this.serviceRepo.findOne({ where: { name: s.name } });
            if (!exists) {
                await this.serviceRepo.save(this.serviceRepo.create(s));
            }
        }
    }
}
