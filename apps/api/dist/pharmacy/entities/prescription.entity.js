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
exports.Prescription = exports.PrescriptionStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const doctor_entity_1 = require("../../doctors/entities/doctor.entity");
const appointment_entity_1 = require("../../appointments/entities/appointment.entity");
const prescription_item_entity_1 = require("./prescription-item.entity");
var PrescriptionStatus;
(function (PrescriptionStatus) {
    PrescriptionStatus["PENDING"] = "pending";
    PrescriptionStatus["ORDERED"] = "ordered";
    PrescriptionStatus["DISPENSED"] = "dispensed";
    PrescriptionStatus["CANCELLED"] = "cancelled";
})(PrescriptionStatus || (exports.PrescriptionStatus = PrescriptionStatus = {}));
let Prescription = class Prescription {
    id;
    appointment;
    appointmentId;
    doctor;
    doctorId;
    doctorSignatureUrl;
    doctorStampUrl;
    patient;
    patientId;
    items;
    status;
    notes;
    validUntil;
    createdAt;
    updatedAt;
};
exports.Prescription = Prescription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Prescription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_entity_1.Appointment, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'appointmentId' }),
    __metadata("design:type", appointment_entity_1.Appointment)
], Prescription.prototype, "appointment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Prescription.prototype, "appointmentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => doctor_entity_1.Doctor),
    (0, typeorm_1.JoinColumn)({ name: 'doctorId' }),
    __metadata("design:type", doctor_entity_1.Doctor)
], Prescription.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], Prescription.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "doctorSignatureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "doctorStampUrl", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patientId' }),
    __metadata("design:type", user_entity_1.User)
], Prescription.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], Prescription.prototype, "patientId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => prescription_item_entity_1.PrescriptionItem, (item) => item.prescription, { cascade: true }),
    __metadata("design:type", Array)
], Prescription.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PrescriptionStatus,
        default: PrescriptionStatus.PENDING,
    }),
    __metadata("design:type", String)
], Prescription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Prescription.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Prescription.prototype, "validUntil", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Prescription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Prescription.prototype, "updatedAt", void 0);
exports.Prescription = Prescription = __decorate([
    (0, typeorm_1.Entity)()
], Prescription);
//# sourceMappingURL=prescription.entity.js.map