"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MpesaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const mpesa_service_1 = require("./mpesa.service");
const mpesa_controller_1 = require("./mpesa.controller");
const mpesa_transaction_entity_1 = require("./entities/mpesa-transaction.entity");
let MpesaModule = class MpesaModule {
};
exports.MpesaModule = MpesaModule;
exports.MpesaModule = MpesaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([mpesa_transaction_entity_1.MpesaTransaction]),
            config_1.ConfigModule,
        ],
        controllers: [mpesa_controller_1.MpesaController],
        providers: [mpesa_service_1.MpesaService],
        exports: [mpesa_service_1.MpesaService],
    })
], MpesaModule);
//# sourceMappingURL=mpesa.module.js.map