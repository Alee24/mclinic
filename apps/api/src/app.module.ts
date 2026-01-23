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
import { EmergencyModule } from './emergency/emergency.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        let dbName = configService.get('DB_NAME');
        let dbUser = configService.get('DB_USER');
        let dbPass = configService.get('DB_PASSWORD');
        let dbHost = configService.get('DB_HOST');
        let dbPort = configService.get('DB_PORT');

        const dbUrl = configService.get('DATABASE_URL');

        // If DATABASE_URL is present, use it to fill in missing gaps
        if (dbUrl) {
          try {
            // Ensure protocol is present for URL parsing
            const urlStr = dbUrl.includes('://') ? dbUrl : `mysql://${dbUrl}`;
            // Replace mysql protocol with http to use standard URL parser
            const urlParts = new URL(urlStr.replace(/^mysql(2)?:\/\//, 'http://'));

            if (!dbName) dbName = urlParts.pathname.replace(/^\//, '');
            if (!dbUser && urlParts.username) dbUser = decodeURIComponent(urlParts.username);
            if (!dbPass && urlParts.password) dbPass = decodeURIComponent(urlParts.password);
            if (!dbHost && urlParts.hostname) dbHost = urlParts.hostname;
            if (!dbPort && urlParts.port) dbPort = urlParts.port;

          } catch (e) {
            console.warn('Failed to parse DATABASE_URL connection string:', e);
          }
        }

        return {
          type: 'mysql',
          host: dbHost || 'localhost',
          port: parseInt(dbPort || '3306'),
          username: dbUser || 'root',
          password: dbPass || '',
          database: dbName || 'mclinicportal', // Fallback
          autoLoadEntities: true,
          synchronize: true, // Enable sync to update schema
          extra: {
            connectionLimit: 10,
            connectTimeout: 60000,
          },
        };
      },
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
    EmergencyModule,
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
