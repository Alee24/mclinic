import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    create(createDoctorDto: any): Promise<import("./entities/doctor.entity").Doctor>;
    findAll(): Promise<any[]>;
    findAllAdmin(): Promise<import("./entities/doctor.entity").Doctor[]>;
    findOne(id: string): Promise<import("./entities/doctor.entity").Doctor | null>;
    verifyDoctor(id: string, status: boolean): Promise<import("./entities/doctor.entity").Doctor | null>;
}
