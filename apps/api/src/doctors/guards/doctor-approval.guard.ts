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

        // For now, if the doctor profile exists, we allow basic access.
        // Status checks are handled in AuthService/DoctorsService if needed.
        if (!doctor.status || doctor.status === 0) {
            throw new ForbiddenException('Your account is currently inactive. Please contact support.');
        }

        return true;
    }
}
