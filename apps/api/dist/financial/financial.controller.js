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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialController = void 0;
const common_1 = require("@nestjs/common");
const financial_service_1 = require("./financial.service");
const passport_1 = require("@nestjs/passport");
const payment_config_entity_1 = require("./entities/payment-config.entity");
let FinancialController = class FinancialController {
    financialService;
    constructor(financialService) {
        this.financialService = financialService;
    }
    setConfig(body) {
        return this.financialService.setConfig(body.provider, body.credentials);
    }
    getConfig(provider) {
        return this.financialService.getConfig(provider);
    }
    setPrice(body) {
        return this.financialService.setPrice(body.serviceName, body.amount, body.doctorId);
    }
    getPrices(doctorId) {
        return this.financialService.getPrices(doctorId ? Number(doctorId) : undefined);
    }
    getTransactions() {
        return this.financialService.getAllTransactions();
    }
    createInvoice(body) {
        return this.financialService.createInvoice(body);
    }
    getInvoices() {
        return this.financialService.getInvoices();
    }
};
exports.FinancialController = FinancialController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "setConfig", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('config/:provider'),
    __param(0, (0, common_1.Param)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "getConfig", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('prices'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "setPrice", null);
__decorate([
    (0, common_1.Get)('prices'),
    __param(0, (0, common_1.Query)('doctorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "getPrices", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('invoices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinancialController.prototype, "getInvoices", null);
exports.FinancialController = FinancialController = __decorate([
    (0, common_1.Controller)('financial'),
    __metadata("design:paramtypes", [financial_service_1.FinancialService])
], FinancialController);
//# sourceMappingURL=financial.controller.js.map