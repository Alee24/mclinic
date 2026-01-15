import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmergencyAlert } from './entities/emergency-alert.entity';

@Injectable()
export class EmergencyService {
    constructor(
        @InjectRepository(EmergencyAlert)
        private emergencyRepository: Repository<EmergencyAlert>,
    ) { }

    async create(medicId: number, latitude: number, longitude: number) {
        const alert = this.emergencyRepository.create({
            medicId,
            latitude,
            longitude,
            status: 'active',
        });
        // Here you would trigger WebSocket / SMS to admin
        console.log(`[Urgent] Panic Alert from Medic ${medicId} at ${latitude}, ${longitude}`);
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
        return this.emergencyRepository.find({ where: { status: 'active' }, relations: ['medic'] });
    }
}
