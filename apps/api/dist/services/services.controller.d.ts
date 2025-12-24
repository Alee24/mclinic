import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    create(createServiceDto: any): Promise<import("./entities/service.entity").Service>;
    findAll(): Promise<import("./entities/service.entity").Service[]>;
    findOne(id: string): Promise<import("./entities/service.entity").Service>;
    update(id: string, updateServiceDto: any): Promise<import("./entities/service.entity").Service>;
    remove(id: string): Promise<void>;
}
