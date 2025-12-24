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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorLicence = void 0;
const typeorm_1 = require("typeorm");
const doctor_entity_1 = require("../../doctors/entities/doctor.entity");
let DoctorLicence = class DoctorLicence {
    id;
    doctor_id;
    doctor;
    licence_no;
    expiry_date;
    document;
    verified;
};
exports.DoctorLicence = DoctorLicence;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], DoctorLicence.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], DoctorLicence.prototype, "doctor_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => doctor_entity_1.Doctor, (doctor) => doctor.licences, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'doctor_id' }),
    __metadata("design:type", doctor_entity_1.Doctor)
], DoctorLicence.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], DoctorLicence.prototype, "licence_no", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], DoctorLicence.prototype, "expiry_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], DoctorLicence.prototype, "document", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DoctorLicence.prototype, "verified", void 0);
exports.DoctorLicence = DoctorLicence = __decorate([
    (0, typeorm_1.Entity)('doctor_licences')
], DoctorLicence);
//# sourceMappingURL=doctor-licence.entity.js.map