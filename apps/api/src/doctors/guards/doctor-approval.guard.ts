import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { DoctorsService } from '../doctors.service';

@Injectable()
export class DoctorApprovalGuard implements CanActivate {
    constructor(private doctorsService: DoctorsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Only apply to doctors
        if (user.role !== 'doctor' && user.role !== 'medic') {
            return true;
        }

        // Find doctor by email
        const doctor = await this.doctorsService.findByEmail(user.email);

        if (!doctor) {
            throw new ForbiddenException('Doctor profile not found');
        }

        // Check approval status
        if (doctor.approvalStatus !== 'approved') {
            throw new ForbiddenException('Your account is pending approval. You can only update your profile at this time.');
        }

        // Check license status
        if (doctor.licenseStatus === 'expired') {
            throw new ForbiddenException('Your license has expired. Please renew to access this feature.');
        }

        return true;
    }
}
