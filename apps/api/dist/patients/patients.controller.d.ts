import { PatientsService } from './patients.service';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(createPatientDto: any): Promise<import("../users/entities/user.entity").User>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<import("../users/entities/user.entity").User | null>;
    getProfile(req: any): Promise<any>;
    update(id: string, updatePatientDto: any): Promise<import("../users/entities/user.entity").User | null>;
}
