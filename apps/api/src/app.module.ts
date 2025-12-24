import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
