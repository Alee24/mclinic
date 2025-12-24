import { PatientsService } from './patients.service';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(createPatientDto: any): Promise<import("../users/entities/user.entity").User>;
    findAll(): Promise<import("../users/entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../users/entities/user.entity").User | null>;
    getProfile(req: any): Promise<import("../users/entities/user.entity").User | null>;
}
