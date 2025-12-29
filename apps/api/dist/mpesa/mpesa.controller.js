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
exports.MpesaController = void 0;
const common_1 = require("@nestjs/common");
const mpesa_service_1 = require("./mpesa.service");
const passport_1 = require("@nestjs/passport");
let MpesaController = class MpesaController {
    mpesaService;
    constructor(mpesaService) {
        this.mpesaService = mpesaService;
    }
    async initiateSTKPush(body) {
        const { phoneNumber, amount, accountReference, transactionDesc, relatedEntity, relatedEntityId } = body;
        return await this.mpesaService.initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc, relatedEntity, relatedEntityId);
    }
    async handleCallback(callbackData) {
        console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));
        try {
            const transaction = await this.mpesaService.handleCallback(callbackData);
            console.log('Transaction updated:', transaction);
            return { ResultCode: 0, ResultDesc: 'Success' };
        }
        catch (error) {
            console.error('Callback processing error:', error);
            return { ResultCode: 1, ResultDesc: 'Failed' };
        }
    }
    async queryStatus(checkoutRequestId) {
        return await this.mpesaService.stkPushQuery(checkoutRequestId);
    }
    async getTransaction(checkoutRequestId) {
        return await this.mpesaService.getTransactionByCheckoutRequestId(checkoutRequestId);
    }
    async getAllTransactions() {
        return await this.mpesaService.getAllTransactions();
    }
};
exports.MpesaController = MpesaController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('stk-push'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "initiateSTKPush", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "handleCallback", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('status/:checkoutRequestId'),
    __param(0, (0, common_1.Param)('checkoutRequestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "queryStatus", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('transaction/:checkoutRequestId'),
    __param(0, (0, common_1.Param)('checkoutRequestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('transactions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MpesaController.prototype, "getAllTransactions", null);
exports.MpesaController = MpesaController = __decorate([
    (0, common_1.Controller)('mpesa'),
    __metadata("design:paramtypes", [mpesa_service_1.MpesaService])
], MpesaController);
//# sourceMappingURL=mpesa.controller.js.map