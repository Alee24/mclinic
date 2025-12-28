import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    create(createDoctorDto: any): Promise<import("./entities/doctor.entity").Doctor>;
    getProfile(req: any): Promise<import("./entities/doctor.entity").Doctor | null>;
    findAll(search?: string): Promise<any[]>;
    findAllAdmin(): Promise<import("./entities/doctor.entity").Doctor[]>;
    findOne(id: string): Promise<import("./entities/doctor.entity").Doctor | null>;
    verifyDoctor(id: string, status: boolean): Promise<import("./entities/doctor.entity").Doctor | null>;
    update(id: string, updateDoctorDto: any): Promise<import("./entities/doctor.entity").Doctor | null>;
    uploadProfile(id: string, file: Express.Multer.File): Promise<import("./entities/doctor.entity").Doctor | null>;
    updateOnlineStatus(id: string, body: {
        status: number;
        latitude?: number;
        longitude?: number;
    }): Promise<import("./entities/doctor.entity").Doctor | null>;
    uploadSignature(id: string, file: Express.Multer.File): Promise<import("./entities/doctor.entity").Doctor | null>;
    uploadStamp(id: string, file: Express.Multer.File): Promise<import("./entities/doctor.entity").Doctor | null>;
}
