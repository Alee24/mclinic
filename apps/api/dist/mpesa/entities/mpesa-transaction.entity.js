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
exports.MpesaTransaction = void 0;
const typeorm_1 = require("typeorm");
let MpesaTransaction = class MpesaTransaction {
    id;
    merchantRequestId;
    checkoutRequestId;
    phoneNumber;
    amount;
    accountReference;
    transactionDesc;
    status;
    resultCode;
    resultDesc;
    mpesaReceiptNumber;
    transactionDate;
    relatedEntity;
    relatedEntityId;
    createdAt;
    updatedAt;
};
exports.MpesaTransaction = MpesaTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MpesaTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "merchantRequestId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "checkoutRequestId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MpesaTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "accountReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "transactionDesc", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'PENDING' }),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "resultCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "resultDesc", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "mpesaReceiptNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'datetime' }),
    __metadata("design:type", Date)
], MpesaTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MpesaTransaction.prototype, "relatedEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], MpesaTransaction.prototype, "relatedEntityId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MpesaTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MpesaTransaction.prototype, "updatedAt", void 0);
exports.MpesaTransaction = MpesaTransaction = __decorate([
    (0, typeorm_1.Entity)()
], MpesaTransaction);
//# sourceMappingURL=mpesa-transaction.entity.js.map