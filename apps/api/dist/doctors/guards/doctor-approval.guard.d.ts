import { CanActivate, ExecutionContext } from '@nestjs/common';
import { DoctorsService } from '../doctors.service';
export declare class DoctorApprovalGuard implements CanActivate {
    private doctorsService;
    constructor(doctorsService: DoctorsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
