"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const faker_1 = require("@faker-js/faker");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/entities/user.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const doctor_entity_1 = require("../doctors/entities/doctor.entity");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const medical_record_entity_1 = require("../medical-records/entities/medical-record.entity");
const transaction_entity_1 = require("../financial/entities/transaction.entity");
const service_price_entity_1 = require("../financial/entities/service-price.entity");
const invoice_entity_1 = require("../financial/entities/invoice.entity");
const invoice_item_entity_1 = require("../financial/entities/invoice-item.entity");
let SeedingService = class SeedingService {
    userRepo;
    patientRepo;
    doctorRepo;
    appointmentRepo;
    recordRepo;
    txRepo;
    priceRepo;
    invoiceRepo;
    itemRepo;
    constructor(userRepo, patientRepo, doctorRepo, appointmentRepo, recordRepo, txRepo, priceRepo, invoiceRepo, itemRepo) {
        this.userRepo = userRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo = doctorRepo;
        this.appointmentRepo = appointmentRepo;
        this.recordRepo = recordRepo;
        this.txRepo = txRepo;
        this.priceRepo = priceRepo;
        this.invoiceRepo = invoiceRepo;
        this.itemRepo = itemRepo;
    }
    async clearAll() {
        await this.itemRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        await this.invoiceRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        await this.txRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        await this.recordRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        await this.appointmentRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        await this.doctorRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        await this.patientRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        await this.priceRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        await this.userRepo.delete({ id: (0, typeorm_2.MoreThanOrEqual)(0) });
        return { message: 'All data dropped successfully.' };
    }
    async seedAll() {
        try {
            await this.clearAll();
            console.log('Cleared all data');
            const docPassword = await bcrypt.hash('Digital2025', 10);
            const docUser = this.userRepo.create({
                email: 'doctor@mclinic.com',
                password: docPassword,
                role: user_entity_1.UserRole.DOCTOR,
                status: true,
                fname: 'John',
                lname: 'Smith',
            });
            await this.userRepo.save(docUser);
            const testDoc = this.doctorRepo.create({
                user: docUser,
                fname: 'John',
                lname: 'Smith',
                dr_type: 'General Physician',
                reg_code: 'MD-777',
                mobile: '0711111111',
                email: 'doctor@mclinic.com',
                Verified_status: 1,
                latitude: -1.286389,
                longitude: 36.817223,
                isWorking: true,
                balance: 0,
                fee: 2000,
                qualification: 'MBBS',
                about: 'Experienced general physician.',
                status: 1,
            });
            await this.doctorRepo.save(testDoc);
            console.log('Created Test Doctor Account: doctor@mclinic.com / Digital2025');
            const patPassword = await bcrypt.hash('Digital2025', 10);
            const patUser = this.userRepo.create({
                email: 'patient@mclinic.com',
                password: patPassword,
                role: user_entity_1.UserRole.PATIENT,
                status: true,
                fname: 'Jane',
                lname: 'Doe',
            });
            await this.userRepo.save(patUser);
            const testPat = this.patientRepo.create({
                user: patUser,
                fname: 'Jane',
                lname: 'Doe',
                mobile: '0722222222',
                dob: '1990-01-01',
                sex: 'Female',
                address: '123 Test Street',
                emergencyContactPhone: '0733333333',
            });
            await this.patientRepo.save(testPat);
            console.log('Created Test Patient Account: patient@mclinic.com / Digital2025');
            const patients = [];
            const adminPassword = await bcrypt.hash('Digital2025', 10);
            const adminUser = this.userRepo.create({
                email: 'mettoalex@gmail.com',
                password: adminPassword,
                role: user_entity_1.UserRole.ADMIN,
                status: true,
                fname: 'Alex',
                lname: 'Metto',
                emailVerifiedAt: new Date(),
            });
            await this.userRepo.save(adminUser);
            console.log('Created Admin Account: mettoalex@gmail.com / Digital2025');
            for (let i = 0; i < 15; i++) {
                const email = faker_1.faker.internet.email();
                const password = await bcrypt.hash('Digital2025', 10);
                const user = this.userRepo.create({
                    email,
                    password,
                    role: user_entity_1.UserRole.PATIENT,
                    status: true,
                    emailVerifiedAt: new Date(),
                });
                await this.userRepo.save(user);
                const patient = this.patientRepo.create({
                    user,
                    fname: faker_1.faker.person.firstName(),
                    lname: faker_1.faker.person.lastName(),
                    dob: faker_1.faker.date.birthdate().toISOString().split('T')[0],
                    sex: faker_1.faker.person.sex(),
                    mobile: faker_1.faker.phone.number(),
                    address: faker_1.faker.location.streetAddress(),
                    emergencyContactPhone: faker_1.faker.phone.number(),
                });
                const savedPatient = await this.patientRepo.save(patient);
                patients.push({ ...savedPatient, user });
            }
            const specialties = [
                'General Surgeon', 'Cardiologist', 'Dermatologist', 'Pediatrician',
                'Neurologist', 'Psychiatrist', 'Orthopedic Surgeon', 'Emergency Physician',
                'Optometrist', 'Dentist'
            ];
            const doctors = [];
            for (let i = 0; i < specialties.length; i++) {
                const email = faker_1.faker.internet.email().toLowerCase();
                const password = await bcrypt.hash('Digital2025', 10);
                const user = this.userRepo.create({
                    email,
                    password,
                    role: user_entity_1.UserRole.DOCTOR,
                    status: true,
                    emailVerifiedAt: new Date(),
                });
                await this.userRepo.save(user);
                const doctor = this.doctorRepo.create({
                    user,
                    fname: faker_1.faker.person.firstName('male'),
                    lname: faker_1.faker.person.lastName(),
                    email,
                    username: faker_1.faker.internet.username(),
                    reg_code: `REG-${Math.floor(100000 + Math.random() * 900000)}`,
                    dr_type: specialties[i],
                    mobile: faker_1.faker.phone.number(),
                    Verified_status: 1,
                    latitude: -1.286389 + (Math.random() - 0.5) * 0.1,
                    longitude: 36.817223 + (Math.random() - 0.5) * 0.1,
                    isWorking: Math.random() > 0.2,
                    balance: parseFloat(faker_1.faker.finance.amount({ min: 1000, max: 50000, dec: 2 })),
                    fee: parseInt(faker_1.faker.helpers.arrayElement(['1500', '2000', '2500', '3000'])),
                    qualification: 'MBBS, MMed',
                    about: faker_1.faker.lorem.paragraph(),
                    status: 1,
                });
                doctors.push(await this.doctorRepo.save(doctor));
            }
            for (let i = 0; i < 20; i++) {
                const patientData = faker_1.faker.helpers.arrayElement(patients);
                const doctor = faker_1.faker.helpers.arrayElement(doctors);
                const futureDate = faker_1.faker.date.future();
                const apt = this.appointmentRepo.create({
                    patient: patientData.user,
                    doctor,
                    appointment_date: futureDate,
                    appointment_time: futureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fee: doctor.fee || 1500,
                    status: faker_1.faker.helpers.arrayElement([
                        appointment_entity_1.AppointmentStatus.PENDING,
                        appointment_entity_1.AppointmentStatus.CONFIRMED,
                        appointment_entity_1.AppointmentStatus.COMPLETED
                    ]),
                    notes: faker_1.faker.lorem.sentence(),
                });
                if (Math.random() > 0.8) {
                    const mid = `mclinic-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    apt.meetingId = mid;
                    apt.meetingLink = `https://meet.jit.si/${mid}`;
                }
                await this.appointmentRepo.save(apt);
            }
            for (let i = 0; i < 12; i++) {
                const patient = faker_1.faker.helpers.arrayElement(patients);
                const doctor = faker_1.faker.helpers.arrayElement(doctors);
                const record = this.recordRepo.create({
                    patient,
                    doctor,
                    diagnosis: 'Common Cold',
                    prescription: 'Rest and fluids',
                    notes: faker_1.faker.lorem.paragraph(),
                });
                await this.recordRepo.save(record);
            }
            const allUsers = await this.userRepo.find();
            for (let i = 0; i < 30; i++) {
                const randomUser = faker_1.faker.helpers.arrayElement(allUsers);
                const isCredit = Math.random() > 0.5;
                const tx = this.txRepo.create({
                    user: randomUser,
                    amount: parseFloat(faker_1.faker.finance.amount({ min: 100, max: 5000, dec: 2 })),
                    type: isCredit ? 'credit' : 'debit',
                    source: faker_1.faker.helpers.arrayElement(['MPESA', 'VISA', 'CASH']),
                    status: faker_1.faker.helpers.arrayElement([
                        transaction_entity_1.TransactionStatus.SUCCESS,
                        transaction_entity_1.TransactionStatus.PENDING,
                        transaction_entity_1.TransactionStatus.FAILED
                    ]),
                    reference: faker_1.faker.string.alphanumeric(10).toUpperCase(),
                });
                await this.txRepo.save(tx);
            }
            const services = ['Consultation', 'Home Visit', 'Lab Test', 'Ambulance', 'Dental Checkup', 'Video Consult'];
            for (const s of services) {
                const price = this.priceRepo.create({
                    serviceName: s,
                    amount: parseFloat(faker_1.faker.finance.amount({ min: 1000, max: 10000, dec: 2 })),
                    currency: 'KES',
                });
                await this.priceRepo.save(price);
            }
            return { message: 'Database cleared and re-seeded successfully with updated schema.', counts: { patients: 10, doctors: 10, appointments: 20, records: 12, transactions: 30 } };
        }
        catch (error) {
            console.error('SEEDING ERROR:', error);
            throw new common_1.InternalServerErrorException(`Seeding failed: ${error.message}`);
        }
    }
};
exports.SeedingService = SeedingService;
exports.SeedingService = SeedingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __param(2, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __param(3, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(4, (0, typeorm_1.InjectRepository)(medical_record_entity_1.MedicalRecord)),
    __param(5, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(6, (0, typeorm_1.InjectRepository)(service_price_entity_1.ServicePrice)),
    __param(7, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(8, (0, typeorm_1.InjectRepository)(invoice_item_entity_1.InvoiceItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedingService);
//# sourceMappingURL=seeding.service.js.map