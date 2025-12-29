"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdCardController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const doctors_service_1 = require("../doctors.service");
const QRCode = __importStar(require("qrcode"));
let IdCardController = class IdCardController {
    doctorsService;
    constructor(doctorsService) {
        this.doctorsService = doctorsService;
    }
    async generateIdCard(id, res) {
        const doctor = await this.doctorsService.findOne(+id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        if (doctor.approvalStatus !== 'approved') {
            return res.status(403).json({ message: 'Only approved doctors can generate ID cards' });
        }
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-doctor/${doctor.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
        const idCardData = {
            doctor: {
                id: doctor.id,
                name: `Dr. ${doctor.fname} ${doctor.lname}`,
                speciality: doctor.speciality || 'General Practice',
                drType: doctor.dr_type,
                licenseNumber: doctor.licenceNo || doctor.reg_code,
                licenseExpiry: doctor.licenseExpiryDate,
                email: doctor.email,
                mobile: doctor.mobile,
                profileImage: doctor.profile_image,
            },
            qrCode: qrCodeDataUrl,
            issuedDate: new Date().toISOString(),
            verificationUrl,
        };
        return res.json(idCardData);
    }
    async verifyDoctor(id) {
        const doctor = await this.doctorsService.findOne(+id);
        if (!doctor) {
            return { valid: false, message: 'Doctor not found' };
        }
        const isValid = doctor.approvalStatus === 'approved' &&
            doctor.licenseStatus === 'valid' &&
            doctor.status === 1;
        return {
            valid: isValid,
            doctor: isValid ? {
                name: `Dr. ${doctor.fname} ${doctor.lname}`,
                speciality: doctor.speciality,
                licenseNumber: doctor.licenceNo || doctor.reg_code,
                licenseExpiry: doctor.licenseExpiryDate,
            } : null,
            message: isValid ? 'Valid doctor credentials' : 'Invalid or inactive doctor',
        };
    }
};
exports.IdCardController = IdCardController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id/id-card'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IdCardController.prototype, "generateIdCard", null);
__decorate([
    (0, common_1.Get)('verify/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IdCardController.prototype, "verifyDoctor", null);
exports.IdCardController = IdCardController = __decorate([
    (0, common_1.Controller)('doctors'),
    __metadata("design:paramtypes", [doctors_service_1.DoctorsService])
], IdCardController);
//# sourceMappingURL=id-card.controller.js.map