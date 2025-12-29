"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const doctors_service_1 = require("./doctors.service");
const doctors_controller_1 = require("./doctors.controller");
const doctor_entity_1 = require("./entities/doctor.entity");
const doctor_schedule_entity_1 = require("../doctor-schedules/entities/doctor-schedule.entity");
const doctor_licence_entity_1 = require("../doctor-licences/entities/doctor-licence.entity");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const users_module_1 = require("../users/users.module");
const email_module_1 = require("../email/email.module");
const license_check_service_1 = require("./services/license-check.service");
let DoctorsModule = class DoctorsModule {
};
exports.DoctorsModule = DoctorsModule;
exports.DoctorsModule = DoctorsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                doctor_entity_1.Doctor,
                doctor_schedule_entity_1.DoctorSchedule,
                doctor_licence_entity_1.DoctorLicence,
                appointment_entity_1.Appointment,
            ]),
            users_module_1.UsersModule,
            email_module_1.EmailModule,
            schedule_1.ScheduleModule.forRoot(),
        ],
        controllers: [doctors_controller_1.DoctorsController],
        providers: [doctors_service_1.DoctorsService, license_check_service_1.LicenseCheckService],
        exports: [doctors_service_1.DoctorsService],
    })
], DoctorsModule);
//# sourceMappingURL=doctors.module.js.map