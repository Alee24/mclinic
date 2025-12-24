import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Service } from '../services/entities/service.entity';
import { Invoice, InvoiceStatus } from '../financial/entities/invoice.entity';

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private appointmentsRepository: Repository<Appointment>,
        @InjectRepository(Service)
        private servicesRepository: Repository<Service>,
        @InjectRepository(Invoice)
        private invoiceRepository: Repository<Invoice>,
    ) { }

    async create(createAppointmentDto: any): Promise<Appointment> {
        const { appointmentDate, appointmentTime, isVirtual, serviceId, ...rest } = createAppointmentDto;

        // Fetch service to get price
        let fee = 0;
        if (serviceId) {
            const service = await this.servicesRepository.findOne({ where: { id: serviceId } });
            if (service) {
                fee = Number(service.price);
            }
        }

        // Conditional Video Link Generation
        let meetingId = null;
        let meetingLink = null;

        if (isVirtual) {
            meetingId = `mclinic-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            meetingLink = `https://meet.jit.si/${meetingId}`;
            console.log(`[NOTIFICATION] Meeting Created. Link sent to Patient: ${meetingLink}`);
        }

        const appointment = this.appointmentsRepository.create({
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            serviceId,
            fee,
            meetingId,
            meetingLink,
            ...rest
        } as DeepPartial<Appointment>);

        const savedAppointment = await this.appointmentsRepository.save(appointment);

        // Create Invoice
        if (fee > 0) {
            // Fetch patient to get details
            const appointmentWithPatient = await this.appointmentsRepository.findOne({
                where: { id: savedAppointment.id },
                relations: ['patient']
            });

            if (appointmentWithPatient?.patient) {
                const invoiceNumber = `INV-${Date.now()}-${savedAppointment.id}`;
                const invoice = this.invoiceRepository.create({
                    invoiceNumber,
                    customerName: `${appointmentWithPatient.patient.fname} ${appointmentWithPatient.patient.lname}`,
                    customerEmail: appointmentWithPatient.patient.mobile || 'noemail@mclinic.com',
                    totalAmount: fee,
                    status: InvoiceStatus.PENDING,
                    dueDate: new Date(appointmentDate),
                });
                await this.invoiceRepository.save(invoice);
                console.log(`[INVOICE] Created invoice ${invoiceNumber} for appointment #${savedAppointment.id}, Amount: KES ${fee}`);
            }
        }

        return savedAppointment;
    }

    async findAll(): Promise<Appointment[]> {
        return this.appointmentsRepository.find({
            relations: ['patient', 'doctor'],
            order: { appointment_date: 'DESC' }
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
