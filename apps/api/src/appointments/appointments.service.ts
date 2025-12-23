import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>,
    ) { }

    async create(createAppointmentDto: any): Promise<Appointment> {
        const { appointmentDate, ...rest } = createAppointmentDto;
        const appointment = this.appointmentsRepository.create({
            dateTime: appointmentDate,
            ...rest
        } as DeepPartial<Appointment>);
        return this.appointmentsRepository.save(appointment);
    }

    async findAll(): Promise<Appointment[]> {
        return this.appointmentsRepository.find({
            relations: ['patient', 'doctor'],
            order: { dateTime: 'DESC' }
        });
    }

    async findByPatient(patientId: number): Promise<Appointment[]> {
        return this.appointmentsRepository.find({
            where: { patientId },
            relations: ['doctor', 'doctor.user']
        });
    }

    async findByDoctor(doctorId: number): Promise<Appointment[]> {
        return this.appointmentsRepository.find({
            where: { doctorId },
            relations: ['patient', 'patient.user']
        });
    }

    async updateStatus(id: number, status: AppointmentStatus): Promise<Appointment | null> {
        await this.appointmentsRepository.update(id, { status });
        return this.appointmentsRepository.findOne({ where: { id } });
    }
}
