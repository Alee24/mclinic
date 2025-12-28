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
exports.AmbulanceSubscription = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
let AmbulanceSubscription = class AmbulanceSubscription {
    id;
    user;
    user_id;
    primary_subscriber_name;
    dob;
    gender;
    identification_number;
    nationality;
    language_spoken;
    photo_url;
    primary_phone;
    secondary_phone;
    email;
    residential_address;
    county;
    estate;
    street;
    house_details;
    landmark;
    gps_coordinates;
    work_address;
    blood_type;
    allergies;
    chronic_conditions;
    current_medications;
    surgical_history;
    disabilities;
    pregnancy_status;
    preferred_hospital;
    insurance_details;
    family_members;
    emergency_contacts;
    package_type;
    status;
    start_date;
    end_date;
    created_at;
    updated_at;
};
exports.AmbulanceSubscription = AmbulanceSubscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AmbulanceSubscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], AmbulanceSubscription.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true, nullable: true }),
    __metadata("design:type", Number)
], AmbulanceSubscription.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "primary_subscriber_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "dob", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "identification_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "nationality", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "language_spoken", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "photo_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "primary_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "secondary_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "residential_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "county", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "estate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "street", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "house_details", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "landmark", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "gps_coordinates", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "work_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 10, nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "blood_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "chronic_conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "current_medications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "surgical_history", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "disabilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "pregnancy_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "preferred_hospital", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "insurance_details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], AmbulanceSubscription.prototype, "family_members", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], AmbulanceSubscription.prototype, "emergency_contacts", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "package_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", String)
], AmbulanceSubscription.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AmbulanceSubscription.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AmbulanceSubscription.prototype, "updated_at", void 0);
exports.AmbulanceSubscription = AmbulanceSubscription = __decorate([
    (0, typeorm_1.Entity)('ambulance_subscriptions')
], AmbulanceSubscription);
//# sourceMappingURL=ambulance-subscription.entity.js.map