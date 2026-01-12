import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { FinancialModule } from './financial/financial.module';
import { SeedingModule } from './seeding/seeding.module';
import { DepartmentsModule } from './departments/departments.module';
import { SpecialitiesModule } from './specialities/specialities.module';
import { LocationsModule } from './locations/locations.module';
import { ServicesModule } from './services/services.module';
import { MigrationModule } from './migration/migration.module';
import { ReviewsModule } from './reviews/reviews.module';
import { MedicalProfilesModule } from './medical-profiles/medical-profiles.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AmbulanceModule } from './ambulance/ambulance.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { WalletsModule } from './wallets/wallets.module';
import { EmailModule } from './email/email.module';
import { MpesaModule } from './mpesa/mpesa.module';
// import { RecommendationsModule } from './recommendations/recommendations.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      username: 'root',
      password: '',
      database: 'mclinic',
      autoLoadEntities: true,
      synchronize: true, // DEV only
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    DoctorsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    FinancialModule,
    SeedingModule,
    DepartmentsModule,
    SpecialitiesModule,
    LocationsModule,
    ServicesModule,
    MigrationModule,
    ReviewsModule,
    MedicalProfilesModule,
    AmbulanceModule,
    PharmacyModule,

    LaboratoryModule,
    WalletsModule,
    EmailModule,
    MpesaModule,
    // RecommendationsModule,
    SystemSettingsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
  ],
})
export class AppModule { }
