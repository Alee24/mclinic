"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PharmacyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pharmacy_service_1 = require("./pharmacy.service");
const pharmacy_controller_1 = require("./pharmacy.controller");
const medication_entity_1 = require("./entities/medication.entity");
const prescription_entity_1 = require("./entities/prescription.entity");
const prescription_item_entity_1 = require("./entities/prescription-item.entity");
const doctors_module_1 = require("../doctors/doctors.module");
const financial_module_1 = require("../financial/financial.module");
const pharmacy_order_entity_1 = require("./entities/pharmacy-order.entity");
const pharmacy_order_item_entity_1 = require("./entities/pharmacy-order-item.entity");
let PharmacyModule = class PharmacyModule {
};
exports.PharmacyModule = PharmacyModule;
exports.PharmacyModule = PharmacyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([medication_entity_1.Medication, prescription_entity_1.Prescription, prescription_item_entity_1.PrescriptionItem, pharmacy_order_entity_1.PharmacyOrder, pharmacy_order_item_entity_1.PharmacyOrderItem]),
            doctors_module_1.DoctorsModule,
            (0, common_1.forwardRef)(() => financial_module_1.FinancialModule),
        ],
        controllers: [pharmacy_controller_1.PharmacyController],
        providers: [pharmacy_service_1.PharmacyService],
        exports: [pharmacy_service_1.PharmacyService],
    })
], PharmacyModule);
//# sourceMappingURL=pharmacy.module.js.map