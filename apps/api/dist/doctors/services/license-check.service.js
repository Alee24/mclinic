"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LicenseCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseCheckService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const doctors_service_1 = require("../doctors.service");
const email_service_1 = require("../../email/email.service");
let LicenseCheckService = LicenseCheckService_1 = class LicenseCheckService {
    doctorsService;
    emailService;
    logger = new common_1.Logger(LicenseCheckService_1.name);
    constructor(doctorsService, emailService) {
        this.doctorsService = doctorsService;
        this.emailService = emailService;
    }
    async checkLicenseExpiry() {
        this.logger.log('Running daily license expiry check...');
        try {
            await this.doctorsService.checkLicenseStatus();
            const expiringDoctors = await this.doctorsService.getExpiringSoonLicenses();
            for (const doctor of expiringDoctors) {
                if (!doctor.licenseExpiryDate)
                    continue;
                const daysRemaining = Math.ceil((new Date(doctor.licenseExpiryDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24));
                try {
                    await this.emailService.sendLicenseExpiryWarning(doctor, daysRemaining);
                    this.logger.log(`Sent expiry warning to doctor ${doctor.id} (${daysRemaining} days remaining)`);
                }
                catch (error) {
                    this.logger.error(`Failed to send expiry warning to doctor ${doctor.id}:`, error);
                }
            }
            this.logger.log('License expiry check completed');
        }
        catch (error) {
            this.logger.error('Error during license expiry check:', error);
        }
    }
    async checkExpiredLicenses() {
        this.logger.log('Checking for expired licenses...');
        try {
            await this.doctorsService.checkLicenseStatus();
            this.logger.log('Expired license check completed');
        }
        catch (error) {
            this.logger.error('Error checking expired licenses:', error);
        }
    }
};
exports.LicenseCheckService = LicenseCheckService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicenseCheckService.prototype, "checkLicenseExpiry", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LicenseCheckService.prototype, "checkExpiredLicenses", null);
exports.LicenseCheckService = LicenseCheckService = LicenseCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [doctors_service_1.DoctorsService,
        email_service_1.EmailService])
], LicenseCheckService);
//# sourceMappingURL=license-check.service.js.map