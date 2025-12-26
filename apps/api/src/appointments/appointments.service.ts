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

        // Calculate Transport Fee
        let transportFee = 0;
        if (createAppointmentDto.patientLocation) {
            // Fetch doctor to get location
            const doctor = await this.appointmentsRepository.manager.getRepository(Doctor).findOne({ where: { id: createAppointmentDto.doctorId } });

            if (doctor && doctor.latitude && doctor.longitude) {
                const dist = this.calculateDistance(
                    createAppointmentDto.patientLocation.lat,
                    createAppointmentDto.patientLocation.lng,
                    Number(doctor.latitude),
                    Number(doctor.longitude)
                );
                // 120 KES per KM
                transportFee = Math.ceil(dist * 120);
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
            transportFee,
            meetingId,
            meetingLink,
            ...rest
        } as DeepPartial<Appointment>);

        const savedAppointment = await this.appointmentsRepository.save(appointment);

        // Create Invoice
        const totalAmount = fee + transportFee;
        if (totalAmount > 0) {
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
                    totalAmount: totalAmount,
                    status: InvoiceStatus.PENDING,
                    dueDate: new Date(appointmentDate),
                });
                await this.invoiceRepository.save(invoice);
                console.log(`[INVOICE] Created invoice ${invoiceNumber} for appointment #${savedAppointment.id}, Amount: KES ${totalAmount} (Fee: ${fee}, Transport: ${transportFee})`);
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
            relations: ['doctor']
        });
    }

    async findByDoctor(doctorId: number): Promise<Appointment[]> {
        return this.appointmentsRepository.find({
            where: { doctorId },
            relations: ['patient']
        });
    }

    async findAllForUser(user: any): Promise<Appointment[]> {
        if (user.role === 'admin') {
            return this.findAll();
        }

        if (user.role === 'doctor') {
            // Find doctor ID by email
            const doctor = await this.appointmentsRepository.manager.getRepository(Doctor).findOne({ where: { email: user.email } });

            if (!doctor) {
                console.warn(`[Appointments] Doctor not found for email: ${user.email}`);
                return [];
            }

            const appointments = await this.appointmentsRepository.find({
                where: { doctorId: doctor.id },
                relations: ['patient', 'doctor'],
                order: { appointment_date: 'DESC' }
            });
            return appointments;
        }

        // Default: Patient
        return this.appointmentsRepository.find({
            where: { patientId: user.sub || user.id }, // sub is often used for ID in JWT
            relations: ['doctor'],
            order: { appointment_date: 'DESC' }
        });
    }

    async findOne(id: number): Promise<Appointment | null> {
        return this.appointmentsRepository.findOne({
            where: { id },
            relations: ['patient', 'doctor']
        });
    }

    async updateStatus(id: number, status: AppointmentStatus): Promise<Appointment | null> {
        await this.appointmentsRepository.update(id, { status });
        return this.appointmentsRepository.findOne({ where: { id } });
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
