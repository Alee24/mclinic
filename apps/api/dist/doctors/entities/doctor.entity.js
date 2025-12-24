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
const speciality_entity_1 = require("../../specialities/entities/speciality.entity");
const doctor_schedule_entity_1 = require("../../doctor-schedules/entities/doctor-schedule.entity");
const doctor_licence_entity_1 = require("../../doctor-licences/entities/doctor-licence.entity");
let Doctor = class Doctor {
    id;
    fname;
    lname;
    username;
    national_id;
    email;
    dob;
    reg_code;
    Verified_status;
    approved_status;
    password;
    mobile;
    address;
    balance;
    sex;
    qualification;
    speciality;
    dr_type;
    about;
    slot_type;
    latitude;
    longitude;
    fee;
    serial_or_slot;
    start_time;
    end_time;
    serial_day;
    max_serial;
    duration;
    department_id;
    location_id;
    licenceNo;
    licenceExpiry;
    residance;
    featured;
    status;
    created_at;
    updated_at;
    profile_image;
    specialities;
    schedules;
    licences;
};
exports.Doctor = Doctor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "id", void 0);
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
    (0, typeorm_1.Column)({ length: 40, unique: true }),
    __metadata("design:type", String)
], Doctor.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "dob", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Doctor.prototype, "reg_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], Doctor.prototype, "Verified_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Pending' }),
    __metadata("design:type", String)
], Doctor.prototype, "approved_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "mobile", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 28, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Doctor.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "sex", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "qualification", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "speciality", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'Nurse' }),
    __metadata("design:type", String)
], Doctor.prototype, "dr_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "about", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', nullable: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "slot_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1500 }),
    __metadata("design:type", Number)
], Doctor.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "serial_or_slot", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 40, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Doctor.prototype, "serial_day", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Doctor.prototype, "max_serial", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Doctor.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "department_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "location_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "licenceNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Doctor.prototype, "licenceExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "residance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], Doctor.prototype, "featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0 }),
    __metadata("design:type", Number)
], Doctor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Doctor.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], Doctor.prototype, "updated_at", void 0);
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
exports.Doctor = Doctor = __decorate([
    (0, typeorm_1.Entity)('doctors')
], Doctor);
//# sourceMappingURL=doctor.entity.js.map