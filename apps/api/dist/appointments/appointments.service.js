"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./entities/appointment.entity");
const doctor_entity_1 = require("../doctors/entities/doctor.entity");
const service_entity_1 = require("../services/entities/service.entity");
const invoice_entity_1 = require("../financial/entities/invoice.entity");
let AppointmentsService = class AppointmentsService {
    appointmentsRepository;
    servicesRepository;
    invoiceRepository;
    constructor(appointmentsRepository, servicesRepository, invoiceRepository) {
        this.appointmentsRepository = appointmentsRepository;
        this.servicesRepository = servicesRepository;
        this.invoiceRepository = invoiceRepository;
    }
    async create(createAppointmentDto) {
        const { appointmentDate, appointmentTime, isVirtual, serviceId, ...rest } = createAppointmentDto;
        let fee = 0;
        if (serviceId) {
            const service = await this.servicesRepository.findOne({ where: { id: serviceId } });
            if (service) {
                fee = Number(service.price);
            }
        }
        let transportFee = 0;
        if (createAppointmentDto.patientLocation) {
            const doctor = await this.appointmentsRepository.manager.getRepository(doctor_entity_1.Doctor).findOne({ where: { id: createAppointmentDto.doctorId } });
            if (doctor && doctor.latitude && doctor.longitude) {
                const dist = this.calculateDistance(createAppointmentDto.patientLocation.lat, createAppointmentDto.patientLocation.lng, Number(doctor.latitude), Number(doctor.longitude));
                transportFee = Math.ceil(dist * 120);
            }
        }
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
        });
        const savedAppointment = await this.appointmentsRepository.save(appointment);
        const totalAmount = fee + transportFee;
        if (totalAmount > 0) {
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
                    status: invoice_entity_1.InvoiceStatus.PENDING,
                    dueDate: new Date(appointmentDate),
                });
                await this.invoiceRepository.save(invoice);
                console.log(`[INVOICE] Created invoice ${invoiceNumber} for appointment #${savedAppointment.id}, Amount: KES ${totalAmount} (Fee: ${fee}, Transport: ${transportFee})`);
            }
        }
        return savedAppointment;
    }
    async findAll() {
        return this.appointmentsRepository.find({
            relations: ['patient', 'doctor'],
            order: { appointment_date: 'DESC' }
        });
    }
    async findByPatient(patientId) {
        return this.appointmentsRepository.find({
            where: { patientId },
            relations: ['doctor']
        });
    }
    async findByDoctor(doctorId) {
        return this.appointmentsRepository.find({
            where: { doctorId },
            relations: ['patient']
        });
    }
    async findAllForUser(user) {
        if (user.role === 'admin') {
            return this.findAll();
        }
        if (user.role === 'doctor') {
            const doctor = await this.appointmentsRepository.manager.getRepository(doctor_entity_1.Doctor).findOne({ where: { email: user.email } });
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
        return this.appointmentsRepository.find({
            where: { patientId: user.sub || user.id },
            relations: ['doctor'],
            order: { appointment_date: 'DESC' }
        });
    }
    async findOne(id) {
        return this.appointmentsRepository.findOne({
            where: { id },
            relations: ['patient', 'doctor']
        });
    }
    async updateStatus(id, status) {
        await this.appointmentsRepository.update(id, { status });
        return this.appointmentsRepository.findOne({ where: { id } });
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(1, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map