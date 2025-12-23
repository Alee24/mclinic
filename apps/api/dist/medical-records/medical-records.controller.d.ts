import { MedicalRecordsService } from './medical-records.service';
export declare class MedicalRecordsController {
    private readonly medicalRecordsService;
    constructor(medicalRecordsService: MedicalRecordsService);
    create(createMedicalRecordDto: any): Promise<import("./entities/medical-record.entity").MedicalRecord>;
    findByPatient(id: string): Promise<import("./entities/medical-record.entity").MedicalRecord[]>;
}
