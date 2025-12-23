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
exports.PaymentConfig = exports.PaymentProvider = void 0;
const typeorm_1 = require("typeorm");
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["MPESA"] = "mpesa";
    PaymentProvider["VISA"] = "visa";
    PaymentProvider["PAYPAL"] = "paypal";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
let PaymentConfig = class PaymentConfig {
    id;
    provider;
    credentials;
    isActive;
    currency;
    createdAt;
    updatedAt;
};
exports.PaymentConfig = PaymentConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PaymentConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PaymentProvider,
        unique: true,
    }),
    __metadata("design:type", String)
], PaymentConfig.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], PaymentConfig.prototype, "credentials", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PaymentConfig.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'KES' }),
    __metadata("design:type", String)
], PaymentConfig.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentConfig.prototype, "updatedAt", void 0);
exports.PaymentConfig = PaymentConfig = __decorate([
    (0, typeorm_1.Entity)()
], PaymentConfig);
//# sourceMappingURL=payment-config.entity.js.map