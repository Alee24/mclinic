import { Repository, DeepPartial } from 'typeorm';
import { Service } from './entities/service.entity';
export declare class ServicesService {
    private servicesRepository;
    constructor(servicesRepository: Repository<Service>);
    create(createServiceDto: DeepPartial<Service>): Promise<Service>;
    findAll(): Promise<Service[]>;
    findOne(id: number): Promise<Service>;
    update(id: number, updateServiceDto: any): Promise<Service>;
    remove(id: number): Promise<void>;
}
