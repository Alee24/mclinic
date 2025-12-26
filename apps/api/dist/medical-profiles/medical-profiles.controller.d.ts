import { MedicalProfilesService } from './medical-profiles.service';
export declare class MedicalProfilesController {
    private readonly service;
    constructor(service: MedicalProfilesService);
    getProfile(req: any): Promise<import("./entities/medical-profile.entity").MedicalProfile>;
    getProfileByUser(userId: string): Promise<import("./entities/medical-profile.entity").MedicalProfile>;
    updateProfile(req: any, body: any): Promise<import("./entities/medical-profile.entity").MedicalProfile>;
}
