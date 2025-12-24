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
exports.Speciality = void 0;
const typeorm_1 = require("typeorm");
const doctor_entity_1 = require("../../doctors/entities/doctor.entity");
let Speciality = class Speciality {
    id;
    name;
    description;
    doctors;
};
exports.Speciality = Speciality;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Speciality.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Speciality.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Speciality.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => doctor_entity_1.Doctor, (doctor) => doctor.specialities),
    __metadata("design:type", Array)
], Speciality.prototype, "doctors", void 0);
exports.Speciality = Speciality = __decorate([
    (0, typeorm_1.Entity)('specialities')
], Speciality);
//# sourceMappingURL=speciality.entity.js.map