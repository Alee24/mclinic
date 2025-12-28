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
exports.PrescriptionItem = void 0;
const typeorm_1 = require("typeorm");
const prescription_entity_1 = require("./prescription.entity");
const medication_entity_1 = require("./medication.entity");
let PrescriptionItem = class PrescriptionItem {
    id;
    prescription;
    prescriptionId;
    medication;
    medicationId;
    medicationName;
    dosage;
    frequency;
    duration;
    quantity;
    instructions;
};
exports.PrescriptionItem = PrescriptionItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PrescriptionItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => prescription_entity_1.Prescription, (prescription) => prescription.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'prescriptionId' }),
    __metadata("design:type", prescription_entity_1.Prescription)
], PrescriptionItem.prototype, "prescription", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PrescriptionItem.prototype, "prescriptionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medication_entity_1.Medication, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'medicationId' }),
    __metadata("design:type", medication_entity_1.Medication)
], PrescriptionItem.prototype, "medication", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PrescriptionItem.prototype, "medicationId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "medicationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "dosage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], PrescriptionItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PrescriptionItem.prototype, "instructions", void 0);
exports.PrescriptionItem = PrescriptionItem = __decorate([
    (0, typeorm_1.Entity)()
], PrescriptionItem);
//# sourceMappingURL=prescription-item.entity.js.map