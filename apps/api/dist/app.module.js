"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const patients_module_1 = require("./patients/patients.module");
const doctors_module_1 = require("./doctors/doctors.module");
const appointments_module_1 = require("./appointments/appointments.module");
const medical_records_module_1 = require("./medical-records/medical-records.module");
const financial_module_1 = require("./financial/financial.module");
const seeding_module_1 = require("./seeding/seeding.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const common_2 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: 3306,
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'mclinic',
                autoLoadEntities: true,
                synchronize: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            patients_module_1.PatientsModule,
            doctors_module_1.DoctorsModule,
            appointments_module_1.AppointmentsModule,
            medical_records_module_1.MedicalRecordsModule,
            financial_module_1.FinancialModule,
            seeding_module_1.SeedingModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_PIPE,
                useValue: new common_2.ValidationPipe({ whitelist: true, transform: true }),
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map