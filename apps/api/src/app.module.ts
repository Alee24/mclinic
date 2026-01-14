import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { EncryptionModule } from './common/encryption.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '3306')),
        username: configService.get('DB_USER', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'mclinicportal'),
        autoLoadEntities: true,
        synchronize: false, // Using Prisma for schema management
      }),
      inject: [ConfigService],
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
    EncryptionModule,
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
