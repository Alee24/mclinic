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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const mpesa_transaction_entity_1 = require("./entities/mpesa-transaction.entity");
let MpesaService = class MpesaService {
    mpesaTransactionRepository;
    configService;
    consumerKey;
    consumerSecret;
    passkey;
    shortcode;
    callbackUrl;
    environment;
    constructor(mpesaTransactionRepository, configService) {
        this.mpesaTransactionRepository = mpesaTransactionRepository;
        this.configService = configService;
        this.consumerKey = this.configService.get('MPESA_CONSUMER_KEY') || '';
        this.consumerSecret = this.configService.get('MPESA_CONSUMER_SECRET') || '';
        this.passkey = this.configService.get('MPESA_PASSKEY') || '';
        this.shortcode = this.configService.get('MPESA_SHORTCODE') || '';
        this.callbackUrl = this.configService.get('MPESA_CALLBACK_URL') || '';
        this.environment = this.configService.get('MPESA_ENV') || 'sandbox';
    }
    get baseUrl() {
        return this.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }
    async getAccessToken() {
        try {
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
            const response = await axios_1.default.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            console.error('M-Pesa Access Token Error:', error.response?.data || error.message);
            throw new common_1.HttpException('Failed to get M-Pesa access token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc, relatedEntity, relatedEntityId) {
        try {
            const accessToken = await this.getAccessToken();
            const timestamp = new Date()
                .toISOString()
                .replace(/[^0-9]/g, '')
                .slice(0, 14);
            const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
            let formattedPhone = phoneNumber.replace(/\s/g, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '254' + formattedPhone.substring(1);
            }
            else if (formattedPhone.startsWith('+254')) {
                formattedPhone = formattedPhone.substring(1);
            }
            else if (!formattedPhone.startsWith('254')) {
                formattedPhone = '254' + formattedPhone;
            }
            const payload = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(amount),
                PartyA: formattedPhone,
                PartyB: this.shortcode,
                PhoneNumber: formattedPhone,
                CallBackURL: this.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc,
            };
            console.log('Initiating STK Push:', { phoneNumber: formattedPhone, amount, accountReference });
            const response = await axios_1.default.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            const transaction = this.mpesaTransactionRepository.create({
                merchantRequestId: response.data.MerchantRequestID,
                checkoutRequestId: response.data.CheckoutRequestID,
                phoneNumber: formattedPhone,
                amount: amount,
                accountReference: accountReference,
                transactionDesc: transactionDesc,
                status: 'PENDING',
                relatedEntity: relatedEntity,
                relatedEntityId: relatedEntityId,
            });
            return await this.mpesaTransactionRepository.save(transaction);
        }
        catch (error) {
            console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
            throw new common_1.HttpException(error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async stkPushQuery(checkoutRequestId) {
        try {
            const accessToken = await this.getAccessToken();
            const timestamp = new Date()
                .toISOString()
                .replace(/[^0-9]/g, '')
                .slice(0, 14);
            const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
            const payload = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId,
            };
            const response = await axios_1.default.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('M-Pesa Query Error:', error.response?.data || error.message);
            throw new common_1.HttpException('Failed to query M-Pesa transaction status', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async handleCallback(callbackData) {
        try {
            const { Body } = callbackData;
            const { stkCallback } = Body;
            const checkoutRequestId = stkCallback.CheckoutRequestID;
            const merchantRequestId = stkCallback.MerchantRequestID;
            const resultCode = stkCallback.ResultCode;
            const resultDesc = stkCallback.ResultDesc;
            const transaction = await this.mpesaTransactionRepository.findOne({
                where: { checkoutRequestId },
            });
            if (!transaction) {
                console.error('Transaction not found:', checkoutRequestId);
                throw new common_1.HttpException('Transaction not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (resultCode === 0) {
                const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
                const mpesaReceiptNumber = callbackMetadata.find((item) => item.Name === 'MpesaReceiptNumber')?.Value;
                const transactionDate = callbackMetadata.find((item) => item.Name === 'TransactionDate')?.Value;
                transaction.status = 'SUCCESS';
                transaction.resultCode = resultCode.toString();
                transaction.resultDesc = resultDesc;
                transaction.mpesaReceiptNumber = mpesaReceiptNumber;
                transaction.transactionDate = transactionDate
                    ? this.parseMpesaDate(transactionDate.toString())
                    : new Date();
            }
            else {
                transaction.status = 'FAILED';
                transaction.resultCode = resultCode.toString();
                transaction.resultDesc = resultDesc;
            }
            return await this.mpesaTransactionRepository.save(transaction);
        }
        catch (error) {
            console.error('M-Pesa Callback Error:', error);
            throw error;
        }
    }
    parseMpesaDate(dateString) {
        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(4, 6)) - 1;
        const day = parseInt(dateString.substring(6, 8));
        const hour = parseInt(dateString.substring(8, 10));
        const minute = parseInt(dateString.substring(10, 12));
        const second = parseInt(dateString.substring(12, 14));
        return new Date(year, month, day, hour, minute, second);
    }
    async getTransactionByCheckoutRequestId(checkoutRequestId) {
        return await this.mpesaTransactionRepository.findOne({
            where: { checkoutRequestId },
        });
    }
    async getAllTransactions() {
        return await this.mpesaTransactionRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
};
exports.MpesaService = MpesaService;
exports.MpesaService = MpesaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mpesa_transaction_entity_1.MpesaTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], MpesaService);
//# sourceMappingURL=mpesa.service.js.map