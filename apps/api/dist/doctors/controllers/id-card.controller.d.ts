import { DoctorsService } from '../doctors.service';
import { Response } from 'express';
export declare class IdCardController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    generateIdCard(id: string, res: Response): Promise<Response<any, Record<string, any>> | {
        valid: boolean;
        message: string;
        doctor?: undefined;
    } | {
        valid: boolean;
        doctor: {
            name: string;
            speciality: string;
            licenseNumber: string;
            licenseExpiry: Date;
        } | null;
        message: string;
    }>;
}
