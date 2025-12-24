"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const seeding_service_1 = require("./seeding.service");
const seeding_controller_1 = require("./seeding.controller");
const user_entity_1 = require("../users/entities/user.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const doctor_entity_1 = require("../doctors/entities/doctor.entity");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const medical_record_entity_1 = require("../medical-records/entities/medical-record.entity");
const transaction_entity_1 = require("../financial/entities/transaction.entity");
const service_price_entity_1 = require("../financial/entities/service-price.entity");
const invoice_entity_1 = require("../financial/entities/invoice.entity");
const invoice_item_entity_1 = require("../financial/entities/invoice-item.entity");
let SeedingModule = class SeedingModule {
};
exports.SeedingModule = SeedingModule;
exports.SeedingModule = SeedingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                patient_entity_1.Patient,
                doctor_entity_1.Doctor,
                appointment_entity_1.Appointment,
                medical_record_entity_1.MedicalRecord,
                transaction_entity_1.Transaction,
                service_price_entity_1.ServicePrice,
                invoice_entity_1.Invoice,
                invoice_item_entity_1.InvoiceItem
            ])
        ],
        controllers: [seeding_controller_1.SeedingController],
        providers: [seeding_service_1.SeedingService],
    })
], SeedingModule);
//# sourceMappingURL=seeding.module.js.map