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
let SeedingService = class SeedingService {
    userRepo;
    patientRepo;
    doctorRepo;
    appointmentRepo;
    recordRepo;
    txRepo;
    priceRepo;
    constructor(userRepo, patientRepo, doctorRepo, appointmentRepo, recordRepo, txRepo, priceRepo) {
        this.userRepo = userRepo;
        this.patientRepo = patientRepo;
        this.doctorRepo = doctorRepo;
        this.appointmentRepo = appointmentRepo;
        this.recordRepo = recordRepo;
        this.txRepo = txRepo;
        this.priceRepo = priceRepo;
    }
    async seedAll() {
        const patients = [];
        for (let i = 0; i < 10; i++) {
            const email = faker_1.faker.internet.email();
            const password = await bcrypt.hash('password123', 10);
            const user = this.userRepo.create({
                email,
                password,
                role: user_entity_1.UserRole.PATIENT,
                isVerified: true,
            });
            await this.userRepo.save(user);
            const patient = this.patientRepo.create({
                user,
                fullName: faker_1.faker.person.fullName(),
                dateOfBirth: faker_1.faker.date.birthdate(),
                gender: faker_1.faker.person.sex(),
                phoneNumber: faker_1.faker.phone.number(),
                address: faker_1.faker.location.streetAddress(),
                emergencyContact: faker_1.faker.phone.number(),
            });
            patients.push(await this.patientRepo.save(patient));
        }
        const doctors = [];
        for (let i = 0; i < 10; i++) {
            const email = faker_1.faker.internet.email();
            const password = await bcrypt.hash('password123', 10);
            const user = this.userRepo.create({
                email,
                password,
                role: user_entity_1.UserRole.DOCTOR,
                isVerified: true,
            });
            await this.userRepo.save(user);
            const doctor = this.doctorRepo.create({
                user,
                fullName: faker_1.faker.person.fullName(),
                specialization: faker_1.faker.person.jobTitle(),
                licenseNumber: faker_1.faker.string.alphanumeric(8).toUpperCase(),
                phoneNumber: faker_1.faker.phone.number(),
                verificationStatus: faker_1.faker.helpers.arrayElement([
                    doctor_entity_1.VerificationStatus.VERIFIED,
                    doctor_entity_1.VerificationStatus.PENDING,
                    doctor_entity_1.VerificationStatus.REJECTED
                ]),
                yearsOfExperience: faker_1.faker.number.int({ min: 1, max: 20 }),
            });
            doctors.push(await this.doctorRepo.save(doctor));
        }
        for (let i = 0; i < 15; i++) {
            const patient = faker_1.faker.helpers.arrayElement(patients);
            const doctor = faker_1.faker.helpers.arrayElement(doctors);
            const apt = this.appointmentRepo.create({
                patient,
                doctor,
                dateTime: faker_1.faker.date.future(),
                status: faker_1.faker.helpers.arrayElement([
                    appointment_entity_1.AppointmentStatus.PENDING,
                    appointment_entity_1.AppointmentStatus.CONFIRMED,
                    appointment_entity_1.AppointmentStatus.COMPLETED,
                    appointment_entity_1.AppointmentStatus.CANCELLED
                ]),
                notes: faker_1.faker.lorem.sentence(),
            });
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
                visitDate: faker_1.faker.date.past(),
            });
            await this.recordRepo.save(record);
        }
        const allUsers = await this.userRepo.find();
        for (let i = 0; i < 20; i++) {
            const randomUser = faker_1.faker.helpers.arrayElement(allUsers);
            const tx = this.txRepo.create({
                transactionReference: faker_1.faker.string.alphanumeric(10).toUpperCase(),
                amount: parseFloat(faker_1.faker.finance.amount({ min: 500, max: 5000, dec: 2 })),
                currency: 'KES',
                status: faker_1.faker.helpers.arrayElement([
                    transaction_entity_1.TransactionStatus.COMPLETED,
                    transaction_entity_1.TransactionStatus.PENDING,
                    transaction_entity_1.TransactionStatus.FAILED
                ]),
                provider: faker_1.faker.helpers.arrayElement(['mpesa', 'visa', 'paypal']),
                user: randomUser,
            });
            await this.txRepo.save(tx);
        }
        const services = ['Consultation', 'Home Visit', 'Lab Test', 'Ambulance'];
        for (const s of services) {
            const price = this.priceRepo.create({
                serviceName: s,
                amount: parseFloat(faker_1.faker.finance.amount({ min: 1000, max: 10000, dec: 2 })),
                currency: 'KES',
            });
            await this.priceRepo.save(price);
        }
        return { message: 'Seeding complete', counts: { patients: 10, doctors: 10, appointments: 15, records: 12, transactions: 20 } };
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedingService);
//# sourceMappingURL=seeding.service.js.map