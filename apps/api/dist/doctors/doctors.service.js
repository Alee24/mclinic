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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const doctor_entity_1 = require("./entities/doctor.entity");
let DoctorsService = class DoctorsService {
    doctorsRepository;
    constructor(doctorsRepository) {
        this.doctorsRepository = doctorsRepository;
    }
    async create(createDoctorDto, user) {
        const isActive = createDoctorDto.licenseExpiryDate ? new Date(createDoctorDto.licenseExpiryDate) > new Date() : true;
        const doctor = this.doctorsRepository.create({
            ...createDoctorDto,
            isActive,
            verificationStatus: isActive ? doctor_entity_1.VerificationStatus.PENDING : doctor_entity_1.VerificationStatus.REJECTED,
        });
        return this.doctorsRepository.save(doctor);
    }
    async checkAndExpireLicenses(doctors) {
        const now = new Date();
        const updates = [];
        for (const doc of doctors) {
            if (doc.isActive && doc.licenseExpiryDate && new Date(doc.licenseExpiryDate) < now) {
                doc.isActive = false;
                doc.verificationStatus = doctor_entity_1.VerificationStatus.REJECTED;
                updates.push(this.doctorsRepository.save(doc));
            }
        }
        await Promise.all(updates);
    }
    async findAllVerified() {
        const activeDocs = await this.doctorsRepository.find({ where: { verificationStatus: doctor_entity_1.VerificationStatus.VERIFIED, isActive: true } });
        await this.checkAndExpireLicenses(activeDocs);
        return this.doctorsRepository.find({ where: { verificationStatus: doctor_entity_1.VerificationStatus.VERIFIED, isActive: true } });
    }
    async findAll() {
        const allDocs = await this.doctorsRepository.find({ relations: ['user'] });
        await this.checkAndExpireLicenses(allDocs);
        return this.doctorsRepository.find({ relations: ['user'] });
    }
    async findOne(id) {
        const doc = await this.doctorsRepository.findOne({ where: { id }, relations: ['user'] });
        if (doc)
            await this.checkAndExpireLicenses([doc]);
        return this.doctorsRepository.findOne({ where: { id }, relations: ['user'] });
    }
    async findByUserId(userId) {
        return this.doctorsRepository.findOne({ where: { userId }, relations: ['user'] });
    }
    async verifyDoctor(id, status) {
        await this.doctorsRepository.update(id, { verificationStatus: status });
        return this.doctorsRepository.findOne({ where: { id } });
    }
};
exports.DoctorsService = DoctorsService;
exports.DoctorsService = DoctorsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DoctorsService);
//# sourceMappingURL=doctors.service.js.map