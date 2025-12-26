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
exports.PatientsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
const patient_entity_1 = require("./entities/patient.entity");
let PatientsService = class PatientsService {
    usersRepository;
    patientsRepository;
    constructor(usersRepository, patientsRepository) {
        this.usersRepository = usersRepository;
        this.patientsRepository = patientsRepository;
    }
    async create(createPatientDto, user) {
        const email = createPatientDto.email || `patient${Date.now()}@mclinic.temp`;
        const password = createPatientDto.password || 'Patient123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        const patientUser = this.usersRepository.create({
            email,
            password: hashedPassword,
            role: user_entity_1.UserRole.PATIENT,
            ...createPatientDto,
        });
        const savedUser = await this.usersRepository.save(patientUser);
        const patientProfile = this.patientsRepository.create({
            user: savedUser,
            user_id: savedUser.id,
            fname: savedUser.fname,
            lname: savedUser.lname,
            mobile: savedUser.mobile,
            dob: savedUser.dob,
            sex: savedUser.sex,
            address: savedUser.address,
            city: savedUser.city,
            latitude: savedUser.latitude,
            longitude: savedUser.longitude,
        });
        await this.patientsRepository.save(patientProfile);
        return savedUser;
    }
    async findAll() {
        const users = await this.usersRepository.find({
            where: { role: user_entity_1.UserRole.PATIENT },
        });
        const profiles = await this.patientsRepository.find();
        return users.map(user => {
            const profile = profiles.find(p => p.user_id === user.id);
            return {
                ...user,
                blood_group: profile?.blood_group,
                genotype: profile?.genotype,
            };
        });
    }
    async findOne(id) {
        return this.usersRepository.findOne({
            where: { id, role: user_entity_1.UserRole.PATIENT },
        });
    }
    async findByUserId(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });
        let patient = await this.patientsRepository.findOne({
            where: { user_id: userId },
        });
        if (!patient && user) {
            patient = this.patientsRepository.create({
                user_id: user.id,
                fname: user.fname,
                lname: user.lname,
                mobile: user.mobile,
            });
            await this.patientsRepository.save(patient);
        }
        return { user, patient };
    }
    async update(id, updateDto) {
        const userFieldsAllowed = [
            'fname', 'lname', 'mobile', 'address', 'city', 'sex', 'dob', 'profilePicture', 'latitude', 'longitude', 'national_id'
        ];
        const medicalFieldsAllowed = [
            'blood_group', 'genotype', 'height', 'weight',
            'allergies', 'medical_history', 'social_history', 'family_history',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation',
            'insurance_provider', 'insurance_policy_no', 'shif_number', 'subscription_plan',
            'current_medications', 'surgical_history', 'disability_status'
        ];
        const userUpdate = {};
        const medicalUpdate = {};
        Object.keys(updateDto).forEach(key => {
            if (userFieldsAllowed.includes(key)) {
                userUpdate[key] = updateDto[key];
            }
            else if (medicalFieldsAllowed.includes(key)) {
                medicalUpdate[key] = updateDto[key];
            }
        });
        if (updateDto.password) {
            userUpdate.password = await bcrypt.hash(updateDto.password, 10);
        }
        if (Object.keys(userUpdate).length > 0) {
            console.log(`[PATIENTS_SVC] Updating User fields for ID ${id}`, userUpdate);
            await this.usersRepository.update(id, userUpdate);
        }
        if (Object.keys(medicalUpdate).length > 0) {
            console.log(`[PATIENTS_SVC] Searching for Patient record with user_id ${id}`);
            const patient = await this.patientsRepository.findOne({ where: { user_id: id } });
            if (patient) {
                console.log(`[PATIENTS_SVC] Found Patient ID ${patient.id}. Updating medical fields.`, medicalUpdate);
                await this.patientsRepository.update(patient.id, medicalUpdate);
            }
            else {
                console.log(`[PATIENTS_SVC] Patient record not found for user_id ${id}. Creating new record.`);
                const newP = this.patientsRepository.create({
                    user_id: id,
                    ...medicalUpdate
                });
                await this.patientsRepository.save(newP);
            }
        }
        else {
            console.log(`[PATIENTS_SVC] No medical fields to update.`);
        }
        return this.findOne(id);
    }
};
exports.PatientsService = PatientsService;
exports.PatientsService = PatientsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PatientsService);
//# sourceMappingURL=patients.service.js.map