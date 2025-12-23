import { DoctorsService } from './doctors.service';
import { VerificationStatus } from './entities/doctor.entity';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    create(req: any, createDoctorDto: any): Promise<import("./entities/doctor.entity").Doctor>;
    findAll(): Promise<import("./entities/doctor.entity").Doctor[]>;
    findAllAdmin(): Promise<import("./entities/doctor.entity").Doctor[]>;
    findOne(id: string): Promise<import("./entities/doctor.entity").Doctor | null>;
    verifyDoctor(id: string, status: VerificationStatus): Promise<import("./entities/doctor.entity").Doctor | null>;
}
