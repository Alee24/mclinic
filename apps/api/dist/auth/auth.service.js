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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const doctors_service_1 = require("../doctors/doctors.service");
const medical_profiles_service_1 = require("../medical-profiles/medical-profiles.service");
const jwt_1 = require("@nestjs/jwt");
const email_service_1 = require("../email/email.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = class AuthService {
    usersService;
    doctorsService;
    medicalProfilesService;
    jwtService;
    emailService;
    constructor(usersService, doctorsService, medicalProfilesService, jwtService, emailService) {
        this.usersService = usersService;
        this.doctorsService = doctorsService;
        this.medicalProfilesService = medicalProfilesService;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user, ipAddress, location) {
        const validUser = await this.validateUser(user.email, user.password);
        if (!validUser) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            email: validUser.email,
            sub: validUser.id,
            role: validUser.role,
        };
        try {
            await this.emailService.sendLoginAttemptEmail(validUser, ipAddress || 'Unknown', location || 'Unknown');
        }
        catch (error) {
            console.error('Failed to send login email:', error);
        }
        return {
            access_token: this.jwtService.sign(payload),
            user: validUser,
        };
    }
    async register(dto) {
        const user = await this.usersService.create(dto);
        if (user.role === 'patient') {
            try {
                await this.medicalProfilesService.update(user.id, {
                    dob: dto.dob,
                    sex: dto.sex,
                    blood_group: dto.blood_group,
                    genotype: dto.genotype,
                    allergies: dto.allergies,
                    medical_history: dto.medical_history,
                    shif_number: dto.shif_number,
                    insurance_provider: dto.insurance_provider,
                    insurance_policy_no: dto.insurance_policy_no,
                    emergency_contact_name: dto.emergency_contact_name,
                    emergency_contact_phone: dto.emergency_contact_phone,
                    emergency_contact_relation: dto.emergency_contact_relation,
                });
            }
            catch (err) {
                console.error('Failed to create medical profile during registration', err);
            }
        }
        try {
            await this.emailService.sendAccountCreationEmail(user, user.role);
        }
        catch (error) {
            console.error('Failed to send welcome email:', error);
        }
        return user;
    }
    async registerDoctor(dto) {
        let role = 'doctor';
        if (dto.cadre === 'Nursing')
            role = 'nurse';
        if (dto.cadre === 'Clinical Officers')
            role = 'clinician';
        const user = await this.usersService.create({
            email: dto.email,
            password: dto.password,
            fname: dto.fname,
            lname: dto.lname,
            role: role,
            status: false,
        });
        const doctor = await this.doctorsService.create({
            ...dto,
            Verified_status: 0,
        }, user);
        try {
            await this.emailService.sendAccountCreationEmail(user, role);
        }
        catch (error) {
            console.error('Failed to send welcome email:', error);
        }
        return { user, doctor };
    }
    async getProfile(userId) {
        const user = await this.usersService.findById(userId);
        if (user) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        doctors_service_1.DoctorsService,
        medical_profiles_service_1.MedicalProfilesService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map