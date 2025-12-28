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
exports.PharmacyOrderItem = void 0;
const typeorm_1 = require("typeorm");
const pharmacy_order_entity_1 = require("./pharmacy-order.entity");
const medication_entity_1 = require("./medication.entity");
let PharmacyOrderItem = class PharmacyOrderItem {
    id;
    orderId;
    order;
    medicationId;
    medication;
    medicationName;
    quantity;
    price;
    subtotal;
};
exports.PharmacyOrderItem = PharmacyOrderItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PharmacyOrderItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PharmacyOrderItem.prototype, "orderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => pharmacy_order_entity_1.PharmacyOrder, (order) => order.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'orderId' }),
    __metadata("design:type", pharmacy_order_entity_1.PharmacyOrder)
], PharmacyOrderItem.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PharmacyOrderItem.prototype, "medicationId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => medication_entity_1.Medication, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'medicationId' }),
    __metadata("design:type", medication_entity_1.Medication)
], PharmacyOrderItem.prototype, "medication", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PharmacyOrderItem.prototype, "medicationName", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], PharmacyOrderItem.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PharmacyOrderItem.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], PharmacyOrderItem.prototype, "subtotal", void 0);
exports.PharmacyOrderItem = PharmacyOrderItem = __decorate([
    (0, typeorm_1.Entity)()
], PharmacyOrderItem);
//# sourceMappingURL=pharmacy-order-item.entity.js.map