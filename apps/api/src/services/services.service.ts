import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(Service)
        private servicesRepository: Repository<Service>,
    ) { }

    async create(createServiceDto: DeepPartial<Service>): Promise<Service> {
        const service = this.servicesRepository.create(createServiceDto);
        return this.servicesRepository.save(service);
    }

    findAll(): Promise<Service[]> {
        return this.servicesRepository.find({ where: { isActive: true } });
    }

    async findOne(id: number): Promise<Service> {
        const service = await this.servicesRepository.findOne({ where: { id } });
        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }
        return service;
    }

    async update(id: number, updateServiceDto: any): Promise<Service> {
        await this.servicesRepository.update(id, updateServiceDto);
        return this.findOne(id);
    }

    async remove(id: number): Promise<void> {
        await this.servicesRepository.delete(id);
    }
}
