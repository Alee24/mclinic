import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { Service } from '../services/entities/service.entity';
import { Invoice } from '../financial/entities/invoice.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Appointment, Service, Invoice])],
    controllers: [AppointmentsController],
    providers: [AppointmentsService],
    exports: [AppointmentsService],
})
export class AppointmentsModule { }
