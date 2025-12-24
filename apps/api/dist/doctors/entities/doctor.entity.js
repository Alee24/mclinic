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
exports.Doctor = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const speciality_entity_1 = require("../../specialities/entities/speciality.entity");
const doctor_schedule_entity_1 = require("../../doctor-schedules/entities/doctor-schedule.entity");
const doctor_licence_entity_1 = require("../../doctor-licences/entities/doctor-licence.entity");
let Doctor = class Doctor {
    id;
    user_id;
    user;
    fname;
    lname;
    username;
    national_id;
    dob;
    sex;
    mobile;
    address;
    about;
    dr_type;
    qualification;
    fee;
    balance;
    approved_status;
    verified_status;
    featured;
    status;
    profile_image;
    specialities;
    schedules;
    licences;
    latitude;
    longitude;
    isWorking;
    createdAt;
    updatedAt;
};
exports.Doctor = Doctor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Doctor.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "fname", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "lname", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "national_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "dob", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "sex", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "about", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Nurse' }),
    __metadata("design:type", String)
], Doctor.prototype, "dr_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "qualification", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1500 }),
    __metadata("design:type", Number)
], Doctor.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 28, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Doctor.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Pending' }),
    __metadata("design:type", String)
], Doctor.prototype, "approved_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Doctor.prototype, "verified_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Doctor.prototype, "featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Doctor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "profile_image", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => speciality_entity_1.Speciality, (speciality) => speciality.doctors),
    (0, typeorm_1.JoinTable)({
        name: 'doctor_specialities',
        joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'speciality_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Doctor.prototype, "specialities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => doctor_schedule_entity_1.DoctorSchedule, (schedule) => schedule.doctor),
    __metadata("design:type", Array)
], Doctor.prototype, "schedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => doctor_licence_entity_1.DoctorLicence, (licence) => licence.doctor),
    __metadata("design:type", Array)
], Doctor.prototype, "licences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Doctor.prototype, "isWorking", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Doctor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Doctor.prototype, "updatedAt", void 0);
exports.Doctor = Doctor = __decorate([
    (0, typeorm_1.Entity)('doctors')
], Doctor);
//# sourceMappingURL=doctor.entity.js.map