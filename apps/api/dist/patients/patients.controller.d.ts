import { PatientsService } from './patients.service';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    create(req: any, createPatientDto: any): Promise<import("./entities/patient.entity").Patient>;
    findAll(): Promise<import("./entities/patient.entity").Patient[]>;
    findOne(id: string): Promise<import("./entities/patient.entity").Patient | null>;
    getProfile(req: any): Promise<import("./entities/patient.entity").Patient | null>;
}
