"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmbulanceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ambulance_subscription_entity_1 = require("./entities/ambulance-subscription.entity");
const ambulance_package_entity_1 = require("./entities/ambulance-package.entity");
const ambulance_controller_1 = require("./ambulance.controller");
const ambulance_service_1 = require("./ambulance.service");
const financial_module_1 = require("../financial/financial.module");
let AmbulanceModule = class AmbulanceModule {
};
exports.AmbulanceModule = AmbulanceModule;
exports.AmbulanceModule = AmbulanceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([ambulance_subscription_entity_1.AmbulanceSubscription, ambulance_package_entity_1.AmbulancePackage]),
            financial_module_1.FinancialModule,
        ],
        controllers: [ambulance_controller_1.AmbulanceController],
        providers: [ambulance_service_1.AmbulanceService]
    })
], AmbulanceModule);
//# sourceMappingURL=ambulance.module.js.map