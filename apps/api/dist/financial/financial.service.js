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
exports.FinancialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_config_entity_1 = require("./entities/payment-config.entity");
const service_price_entity_1 = require("./entities/service-price.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
const invoice_entity_1 = require("./entities/invoice.entity");
let FinancialService = class FinancialService {
    configRepo;
    priceRepo;
    txRepo;
    invoiceRepo;
    constructor(configRepo, priceRepo, txRepo, invoiceRepo) {
        this.configRepo = configRepo;
        this.priceRepo = priceRepo;
        this.txRepo = txRepo;
        this.invoiceRepo = invoiceRepo;
    }
    async setConfig(provider, credentials) {
        let config = await this.configRepo.findOne({ where: { provider } });
        if (!config) {
            config = this.configRepo.create({ provider });
        }
        config.credentials = JSON.stringify(credentials);
        return this.configRepo.save(config);
    }
    async getConfig(provider) {
        return this.configRepo.findOne({ where: { provider } });
    }
    async setPrice(serviceName, amount, doctorId) {
        const where = { serviceName };
        if (doctorId) {
            where.doctorId = doctorId;
        }
        else {
            where.doctorId = (0, typeorm_2.IsNull)();
        }
        let existingPrice = await this.priceRepo.findOne({ where });
        let priceToSave;
        if (existingPrice) {
            priceToSave = existingPrice;
        }
        else {
            priceToSave = this.priceRepo.create({
                serviceName,
                doctorId: doctorId || null,
            });
        }
        priceToSave.amount = amount;
        return this.priceRepo.save(priceToSave);
    }
    async getPrices(doctorId) {
        const query = this.priceRepo.createQueryBuilder('price')
            .where('price.doctorId IS NULL');
        if (doctorId) {
            query.orWhere('price.doctorId = :doctorId', { doctorId });
        }
        return query.getMany();
    }
    async recordTransaction(data) {
        const tx = this.txRepo.create(data);
        return this.txRepo.save(tx);
    }
    async getAllTransactions() {
        return this.txRepo.find({ order: { createdAt: 'DESC' }, relations: ['user'] });
    }
    async createInvoice(data) {
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        let totalAmount = 0;
        const items = data.items.map(item => {
            const amount = item.quantity * item.unitPrice;
            totalAmount += amount;
            return {
                ...item,
                amount,
            };
        });
        const invoice = this.invoiceRepo.create({
            invoiceNumber,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            dueDate: data.dueDate,
            totalAmount,
            status: invoice_entity_1.InvoiceStatus.PENDING,
            items,
        });
        return this.invoiceRepo.save(invoice);
    }
    async getInvoices() {
        return this.invoiceRepo.find({ order: { createdAt: 'DESC' }, relations: ['items'] });
    }
};
exports.FinancialService = FinancialService;
exports.FinancialService = FinancialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_config_entity_1.PaymentConfig)),
    __param(1, (0, typeorm_1.InjectRepository)(service_price_entity_1.ServicePrice)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(3, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FinancialService);
//# sourceMappingURL=financial.service.js.map