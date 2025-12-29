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
    findPending(): Promise<import("./entities/doctor.entity").Doctor[]>;
    approveDoctor(id: string, req: any): Promise<import("./entities/doctor.entity").Doctor>;
    rejectDoctor(id: string, reason: string, req: any): Promise<import("./entities/doctor.entity").Doctor>;
    renewLicense(id: string, expiryDate: string): Promise<import("./entities/doctor.entity").Doctor>;
    remove(id: string): Promise<void>;
    suspend(id: string, reason: string): Promise<import("./entities/doctor.entity").Doctor>;
    activate(id: string): Promise<import("./entities/doctor.entity").Doctor>;
    deactivate(id: string): Promise<import("./entities/doctor.entity").Doctor>;
}
