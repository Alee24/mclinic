"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const financial_service_1 = require("./financial.service");
const financial_controller_1 = require("./financial.controller");
const payment_config_entity_1 = require("./entities/payment-config.entity");
const service_price_entity_1 = require("./entities/service-price.entity");
const transaction_entity_1 = require("./entities/transaction.entity");
const invoice_entity_1 = require("./entities/invoice.entity");
const invoice_item_entity_1 = require("./entities/invoice-item.entity");
const wallet_entity_1 = require("../wallets/entities/wallet.entity");
let FinancialModule = class FinancialModule {
};
exports.FinancialModule = FinancialModule;
exports.FinancialModule = FinancialModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([payment_config_entity_1.PaymentConfig, service_price_entity_1.ServicePrice, transaction_entity_1.Transaction, invoice_entity_1.Invoice, invoice_item_entity_1.InvoiceItem, wallet_entity_1.Wallet])],
        controllers: [financial_controller_1.FinancialController],
        providers: [financial_service_1.FinancialService],
        exports: [financial_service_1.FinancialService],
    })
], FinancialModule);
//# sourceMappingURL=financial.module.js.map