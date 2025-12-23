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
exports.Appointment = exports.AppointmentStatus = void 0;
const typeorm_1 = require("typeorm");
const patient_entity_1 = require("../../patients/entities/patient.entity");
const doctor_entity_1 = require("../../doctors/entities/doctor.entity");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PENDING"] = "pending";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["CANCELLED"] = "cancelled";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
let Appointment = class Appointment {
    id;
    patient;
    patientId;
    doctor;
    doctorId;
    dateTime;
    status;
    notes;
    createdAt;
    updatedAt;
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_entity_1.Patient),
    __metadata("design:type", patient_entity_1.Patient)
], Appointment.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Appointment.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => doctor_entity_1.Doctor),
    __metadata("design:type", doctor_entity_1.Doctor)
], Appointment.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Appointment.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Appointment.prototype, "dateTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.PENDING,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "updatedAt", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)()
], Appointment);
//# sourceMappingURL=appointment.entity.js.map