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
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const patients_module_1 = require("./patients/patients.module");
const doctors_module_1 = require("./doctors/doctors.module");
const appointments_module_1 = require("./appointments/appointments.module");
const medical_records_module_1 = require("./medical-records/medical-records.module");
const financial_module_1 = require("./financial/financial.module");
const seeding_module_1 = require("./seeding/seeding.module");
const departments_module_1 = require("./departments/departments.module");
const specialities_module_1 = require("./specialities/specialities.module");
const locations_module_1 = require("./locations/locations.module");
const services_module_1 = require("./services/services.module");
const migration_module_1 = require("./migration/migration.module");
const reviews_module_1 = require("./reviews/reviews.module");
const medical_profiles_module_1 = require("./medical-profiles/medical-profiles.module");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const common_2 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const ambulance_module_1 = require("./ambulance/ambulance.module");
const pharmacy_module_1 = require("./pharmacy/pharmacy.module");
const laboratory_module_1 = require("./laboratory/laboratory.module");
const wallets_module_1 = require("./wallets/wallets.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: '127.0.0.1',
                port: 3306,
                username: 'root',
                password: '',
                database: 'mclinic',
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
            departments_module_1.DepartmentsModule,
            specialities_module_1.SpecialitiesModule,
            locations_module_1.LocationsModule,
            services_module_1.ServicesModule,
            migration_module_1.MigrationModule,
            reviews_module_1.ReviewsModule,
            medical_profiles_module_1.MedicalProfilesModule,
            ambulance_module_1.AmbulanceModule,
            pharmacy_module_1.PharmacyModule,
            laboratory_module_1.LaboratoryModule,
            wallets_module_1.WalletsModule,
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