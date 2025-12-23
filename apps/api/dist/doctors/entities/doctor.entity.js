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
exports.Doctor = exports.VerificationStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["REJECTED"] = "rejected";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
let Doctor = class Doctor {
    id;
    user;
    userId;
    name;
    specialty;
    licenseNumber;
    verificationStatus;
    boardNumber;
    qualifications;
    licenseExpiryDate;
    isActive;
    bio;
    hospitalAffiliation;
    createdAt;
    updatedAt;
};
exports.Doctor = Doctor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Doctor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", user_entity_1.User)
], Doctor.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Doctor.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Doctor.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Doctor.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Doctor.prototype, "licenseNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: VerificationStatus,
        default: VerificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], Doctor.prototype, "verificationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "boardNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "qualifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Doctor.prototype, "licenseExpiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Doctor.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Doctor.prototype, "hospitalAffiliation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Doctor.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Doctor.prototype, "updatedAt", void 0);
exports.Doctor = Doctor = __decorate([
    (0, typeorm_1.Entity)()
], Doctor);
//# sourceMappingURL=doctor.entity.js.map