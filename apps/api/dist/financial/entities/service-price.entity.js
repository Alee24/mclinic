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
exports.ServicePrice = void 0;
const typeorm_1 = require("typeorm");
const doctor_entity_1 = require("../../doctors/entities/doctor.entity");
let ServicePrice = class ServicePrice {
    id;
    serviceName;
    amount;
    currency;
    doctorId;
    doctor;
    createdAt;
    updatedAt;
};
exports.ServicePrice = ServicePrice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ServicePrice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ServicePrice.prototype, "serviceName", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ServicePrice.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'KES' }),
    __metadata("design:type", String)
], ServicePrice.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'bigint', unsigned: true }),
    __metadata("design:type", Number)
], ServicePrice.prototype, "doctorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => doctor_entity_1.Doctor, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'doctorId' }),
    __metadata("design:type", doctor_entity_1.Doctor)
], ServicePrice.prototype, "doctor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ServicePrice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ServicePrice.prototype, "updatedAt", void 0);
exports.ServicePrice = ServicePrice = __decorate([
    (0, typeorm_1.Entity)()
], ServicePrice);
//# sourceMappingURL=service-price.entity.js.map