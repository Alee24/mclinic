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
exports.AmbulancePackage = void 0;
const typeorm_1 = require("typeorm");
let AmbulancePackage = class AmbulancePackage {
    id;
    name;
    description;
    price;
    validity_days;
    features;
    max_adults;
    max_children;
    is_active;
    created_at;
    updated_at;
};
exports.AmbulancePackage = AmbulancePackage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AmbulancePackage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], AmbulancePackage.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AmbulancePackage.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], AmbulancePackage.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 365 }),
    __metadata("design:type", Number)
], AmbulancePackage.prototype, "validity_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], AmbulancePackage.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], AmbulancePackage.prototype, "max_adults", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], AmbulancePackage.prototype, "max_children", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AmbulancePackage.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AmbulancePackage.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AmbulancePackage.prototype, "updated_at", void 0);
exports.AmbulancePackage = AmbulancePackage = __decorate([
    (0, typeorm_1.Entity)('ambulance_packages')
], AmbulancePackage);
//# sourceMappingURL=ambulance-package.entity.js.map