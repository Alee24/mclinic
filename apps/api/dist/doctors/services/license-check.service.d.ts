import { DoctorsService } from '../doctors.service';
import { EmailService } from '../../email/email.service';
export declare class LicenseCheckService {
    private doctorsService;
    private emailService;
    private readonly logger;
    constructor(doctorsService: DoctorsService, emailService: EmailService);
    checkLicenseExpiry(): Promise<void>;
    checkExpiredLicenses(): Promise<void>;
}
