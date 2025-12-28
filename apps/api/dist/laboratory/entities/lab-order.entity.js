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
exports.LabOrder = exports.OrderStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const lab_test_entity_1 = require("./lab-test.entity");
const lab_result_entity_1 = require("./lab-result.entity");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["SAMPLE_RECEIVED"] = "sample_received";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let LabOrder = class LabOrder {
    id;
    patient;
    patient_id;
    test;
    test_id;
    status;
    sample_collection_date;
    results;
    report_url;
    createdAt;
    updatedAt;
};
exports.LabOrder = LabOrder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LabOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", user_entity_1.User)
], LabOrder.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', unsigned: true, nullable: true }),
    __metadata("design:type", Number)
], LabOrder.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lab_test_entity_1.LabTest),
    (0, typeorm_1.JoinColumn)({ name: 'test_id' }),
    __metadata("design:type", lab_test_entity_1.LabTest)
], LabOrder.prototype, "test", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LabOrder.prototype, "test_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    }),
    __metadata("design:type", String)
], LabOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], LabOrder.prototype, "sample_collection_date", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lab_result_entity_1.LabResult, result => result.order),
    __metadata("design:type", Array)
], LabOrder.prototype, "results", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LabOrder.prototype, "report_url", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LabOrder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LabOrder.prototype, "updatedAt", void 0);
exports.LabOrder = LabOrder = __decorate([
    (0, typeorm_1.Entity)()
], LabOrder);
//# sourceMappingURL=lab-order.entity.js.map