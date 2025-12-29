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
const patient_entity_1 = require("../patients/entities/patient.entity");
const service_entity_1 = require("../services/entities/service.entity");
const invoice_entity_1 = require("../financial/entities/invoice.entity");
const financial_service_1 = require("../financial/financial.service");
const email_service_1 = require("../email/email.service");
let AppointmentsService = class AppointmentsService {
    appointmentsRepository;
    servicesRepository;
    invoiceRepository;
    financialService;
    emailService;
    constructor(appointmentsRepository, servicesRepository, invoiceRepository, financialService, emailService) {
        this.appointmentsRepository = appointmentsRepository;
        this.servicesRepository = servicesRepository;
        this.invoiceRepository = invoiceRepository;
        this.financialService = financialService;
        this.emailService = emailService;
    }
    async create(createAppointmentDto) {
        const { appointmentDate, appointmentTime, isVirtual, serviceId, isForSelf, beneficiaryName, beneficiaryGender, beneficiaryAge, beneficiaryRelation, activeMedications, currentPrescriptions, homeAddress, ...rest } = createAppointmentDto;
        let finalServiceId = serviceId;
        if (typeof serviceId === 'string' && isNaN(Number(serviceId))) {
            finalServiceId = null;
        }
        else if (serviceId) {
            finalServiceId = Number(serviceId);
        }
        const doctor = await this.appointmentsRepository.manager
            .getRepository(doctor_entity_1.Doctor)
            .findOne({ where: { id: createAppointmentDto.doctorId } });
        if (!doctor) {
            throw new common_1.BadRequestException('Doctor not found.');
        }
        let fee = 0;
        if (finalServiceId) {
            const service = await this.servicesRepository.findOne({
                where: { id: finalServiceId },
            });
            if (service) {
                fee = Number(service.price);
            }
        }
        else {
            const drType = (doctor.dr_type || '').toLowerCase();
            console.log(`[DEBUG_FEE] Doctor ID: ${doctor.id}, Type: ${drType}, DB Fee: ${doctor.fee}`);
            if (drType.includes('nurse') || drType.includes('clinician')) {
                fee = 1500;
            }
            else {
                fee = Number(doctor.fee || 1500);
            }
            console.log(`[DEBUG_FEE] Calculated Fee: ${fee}`);
        }
        let transportFee = 0;
        if (createAppointmentDto.patientLocation) {
            if (doctor && doctor.latitude && doctor.longitude) {
                const dist = this.calculateDistance(createAppointmentDto.patientLocation.lat, createAppointmentDto.patientLocation.lng, Number(doctor.latitude), Number(doctor.longitude));
                transportFee = Math.ceil(dist * 120);
                if (transportFee < 150)
                    transportFee = 150;
            }
        }
        if (isVirtual) {
            console.log(`[CREATE-APPT] Virtual Session detected. Setting Transport Fee to 0.`);
            transportFee = 0;
        }
        let meetingId = null;
        let meetingLink = null;
        if (isVirtual) {
            meetingId = `mclinic-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            meetingLink = `https://virtual.mclinic.co.ke/${meetingId}`;
            console.log(`[NOTIFICATION] Meeting Created. Link sent to Patient: ${meetingLink}`);
        }
        const appointment = this.appointmentsRepository.create({
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            serviceId: finalServiceId,
            fee,
            transportFee,
            meetingId,
            meetingLink,
            isForSelf: isForSelf ?? true,
            beneficiaryName,
            beneficiaryGender,
            beneficiaryAge,
            beneficiaryRelation,
            activeMedications,
            currentPrescriptions,
            homeAddress,
            ...rest,
        });
        const savedAppointment = await this.appointmentsRepository.save(appointment);
        const totalAmount = fee + transportFee;
        if (totalAmount > 0) {
            const appointmentWithPatient = await this.appointmentsRepository.findOne({
                where: { id: savedAppointment.id },
                relations: ['patient'],
            });
            if (appointmentWithPatient?.patient) {
                const invoiceNumber = `INV-${Date.now()}-${savedAppointment.id}`;
                const commission = fee * 0.4;
                const doctorShare = fee * 0.6 + transportFee;
                const invoice = this.invoiceRepository.create({
                    invoiceNumber,
                    customerName: `${appointmentWithPatient.patient.fname} ${appointmentWithPatient.patient.lname}`,
                    customerEmail: appointmentWithPatient.patient.mobile || 'noemail@mclinic.com',
                    totalAmount: totalAmount,
                    status: invoice_entity_1.InvoiceStatus.PAID,
                    dueDate: new Date(appointmentDate),
                    commissionAmount: commission,
                    doctorId: createAppointmentDto.doctorId,
                    appointment: savedAppointment,
                    appointmentId: savedAppointment.id,
                });
                await this.invoiceRepository.save(invoice);
                await this.appointmentsRepository.manager
                    .getRepository('Transaction')
                    .save({
                    amount: totalAmount,
                    source: 'SYSTEM',
                    reference: `SYS-${Date.now()}`,
                    status: 'pending',
                    invoice: invoice,
                    invoiceId: invoice.id,
                    type: 'credit',
                    createdAt: new Date()
                });
                console.log(`[INVOICE] Created PAID invoice ${invoiceNumber}. Funds HELD for Doctor (Pending Completion).`);
            }
        }
        try {
            const appointmentWithRelations = await this.appointmentsRepository.findOne({
                where: { id: savedAppointment.id },
                relations: ['patient', 'doctor'],
            });
            if (appointmentWithRelations?.patient && appointmentWithRelations?.doctor) {
                await this.emailService.sendBookingConfirmationEmail(appointmentWithRelations.patient, appointmentWithRelations, appointmentWithRelations.doctor);
            }
        }
        catch (error) {
            console.error('Failed to send booking confirmation email:', error);
        }
        return savedAppointment;
    }
    async findAll() {
        return this.appointmentsRepository.find({
            relations: ['patient', 'doctor', 'service'],
            order: { appointment_date: 'DESC' },
        });
    }
    async findByPatient(patientId) {
        return this.appointmentsRepository.find({
            where: { patientId },
            relations: ['doctor', 'service'],
        });
    }
    async diagnoseUser(user) {
        const doctor = await this.appointmentsRepository.manager
            .getRepository(doctor_entity_1.Doctor)
            .findOne({ where: { email: user.email } });
        const appointments = doctor
            ? await this.appointmentsRepository.count({ where: { doctorId: doctor.id } })
            : 0;
        return {
            userContext: user,
            doctorMatch: doctor ? { id: doctor.id, email: doctor.email, type: doctor.dr_type } : null,
            appointmentsCount: appointments
        };
    }
    async findByDoctor(doctorId) {
        return this.appointmentsRepository.find({
            where: { doctorId },
            relations: ['patient', 'service'],
        });
    }
    async findAllForUser(user) {
        if (user.role === 'admin') {
            return this.findAll();
        }
        console.log(`[Appointments] findAllForUser called. Role: ${user.role}, Email: ${user.email}`);
        if (user.role === 'doctor' || user.role === 'nurse' || user.role === 'clinician') {
            const doctor = await this.appointmentsRepository.manager
                .getRepository(doctor_entity_1.Doctor)
                .findOne({ where: { email: user.email } });
            console.log(`[Appointments] Doctor match attempt for ${user.email}:`, doctor ? `Found ID ${doctor.id}` : 'Not Found');
            if (!doctor) {
                console.warn(`[Appointments] Provider (Dr/Nurse/Clinician) not found for email: ${user.email}`);
                return [];
            }
            const appointments = await this.appointmentsRepository.find({
                where: { doctorId: doctor.id },
                relations: ['patient', 'doctor', 'service'],
                order: { appointment_date: 'DESC' },
            });
            const userIds = appointments.map((a) => a.patient?.id).filter(Boolean);
            if (userIds.length > 0) {
                const profiles = await this.appointmentsRepository.manager
                    .getRepository(patient_entity_1.Patient)
                    .createQueryBuilder('patient')
                    .where('patient.user_id IN (:...ids)', { ids: userIds })
                    .getMany();
                appointments.forEach((a) => {
                    if (a.patient) {
                        const profile = profiles.find((p) => p.user_id === a.patient.id);
                        if (profile) {
                            a.patient.blood_group = profile.blood_group;
                            a.patient.sex = profile.sex || a.patient.sex;
                            a.patient.genotype = profile.genotype;
                            a.patient.allergies = profile.allergies;
                            a.patient.conditions = profile.medical_history;
                            a.patient.emergency_contact = profile.emergency_contact_name;
                        }
                    }
                });
            }
            return appointments;
        }
        return this.appointmentsRepository.find({
            where: { patientId: user.sub || user.id },
            relations: ['doctor', 'service'],
            order: { appointment_date: 'DESC' },
        });
    }
    async findOne(id) {
        return this.appointmentsRepository.findOne({
            where: { id },
            relations: ['patient', 'doctor', 'service'],
        });
    }
    async updateStatus(id, status) {
        const appointment = await this.appointmentsRepository.findOne({ where: { id } });
        if (!appointment)
            return null;
        await this.appointmentsRepository.update(id, { status });
        if (status === appointment_entity_1.AppointmentStatus.COMPLETED) {
            await this.financialService.releaseFunds(id);
        }
        return this.appointmentsRepository.findOne({ where: { id } });
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    async reschedule(id, date, time) {
        const appointment = await this.findOne(id);
        if (!appointment) {
            throw new common_1.NotFoundException(`Appointment #${id} not found`);
        }
        appointment.appointment_date = new Date(date);
        appointment.appointment_time = time;
        appointment.status = appointment_entity_1.AppointmentStatus.RESCHEDULED;
        return this.appointmentsRepository.save(appointment);
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
        typeorm_2.Repository,
        financial_service_1.FinancialService,
        email_service_1.EmailService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map