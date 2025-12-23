import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor, VerificationStatus } from '../doctors/entities/doctor.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { MedicalRecord } from '../medical-records/entities/medical-record.entity';
import { Transaction, TransactionStatus } from '../financial/entities/transaction.entity';
import { ServicePrice } from '../financial/entities/service-price.entity';

@Injectable()
export class SeedingService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Patient) private patientRepo: Repository<Patient>,
        @InjectRepository(Doctor) private doctorRepo: Repository<Doctor>,
        @InjectRepository(Appointment) private appointmentRepo: Repository<Appointment>,
        @InjectRepository(MedicalRecord) private recordRepo: Repository<MedicalRecord>,
        @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
        @InjectRepository(ServicePrice) private priceRepo: Repository<ServicePrice>,
    ) { }

    async seedAll() {
        // 1. Seed Patients
        const patients = [];
        for (let i = 0; i < 10; i++) {
            const email = faker.internet.email();
            const password = await bcrypt.hash('password123', 10);

            const user = this.userRepo.create({
                email,
                password,
                role: UserRole.PATIENT,
                isVerified: true,
            });
            await this.userRepo.save(user);

            const patient = this.patientRepo.create({
                user,
                fullName: faker.person.fullName(),
                dateOfBirth: faker.date.birthdate(),
                gender: faker.person.sex(),
                phoneNumber: faker.phone.number(),
                address: faker.location.streetAddress(),
                emergencyContact: faker.phone.number(),
            } as any);
            patients.push(await this.patientRepo.save(patient));
        }

        // 2. Seed Doctors
        const doctors = [];
        for (let i = 0; i < 10; i++) {
            const email = faker.internet.email();
            const password = await bcrypt.hash('password123', 10);

            const user = this.userRepo.create({
                email,
                password,
                role: UserRole.DOCTOR,
                isVerified: true,
            });
            await this.userRepo.save(user);

            const doctor = this.doctorRepo.create({
                user,
                fullName: faker.person.fullName(),
                specialization: faker.person.jobTitle(),
                licenseNumber: faker.string.alphanumeric(8).toUpperCase(),
                phoneNumber: faker.phone.number(),
                verificationStatus: faker.helpers.arrayElement([
                    VerificationStatus.VERIFIED,
                    VerificationStatus.PENDING,
                    VerificationStatus.REJECTED
                ]),
                yearsOfExperience: faker.number.int({ min: 1, max: 20 }),
            } as any);
            doctors.push(await this.doctorRepo.save(doctor));
        }

        // 3. Seed Appointments
        for (let i = 0; i < 15; i++) {
            const patient = faker.helpers.arrayElement(patients);
            const doctor = faker.helpers.arrayElement(doctors);

            const apt = this.appointmentRepo.create({
                patient,
                doctor,
                dateTime: faker.date.future(),
                status: faker.helpers.arrayElement([
                    AppointmentStatus.PENDING,
                    AppointmentStatus.CONFIRMED,
                    AppointmentStatus.COMPLETED,
                    AppointmentStatus.CANCELLED
                ]),
                notes: faker.lorem.sentence(),
            } as any);
            await this.appointmentRepo.save(apt);
        }

        // 4. Seed Medical Records
        for (let i = 0; i < 12; i++) {
            const patient = faker.helpers.arrayElement(patients);
            const doctor = faker.helpers.arrayElement(doctors);

            const record = this.recordRepo.create({
                patient,
                doctor,
                diagnosis: 'Common Cold',
                prescription: 'Rest and fluids',
                notes: faker.lorem.paragraph(),
                visitDate: faker.date.past(),
            } as any);
            await this.recordRepo.save(record);
        }

        // 5. Seed Transactions by fetching random users from DB to be safe
        const allUsers = await this.userRepo.find();
        for (let i = 0; i < 20; i++) {
            const randomUser = faker.helpers.arrayElement(allUsers);

            const tx = this.txRepo.create({
                transactionReference: faker.string.alphanumeric(10).toUpperCase(),
                amount: parseFloat(faker.finance.amount({ min: 500, max: 5000, dec: 2 })),
                currency: 'KES',
                status: faker.helpers.arrayElement([
                    TransactionStatus.COMPLETED,
                    TransactionStatus.PENDING,
                    TransactionStatus.FAILED
                ]),
                provider: faker.helpers.arrayElement(['mpesa', 'visa', 'paypal']),
                user: randomUser,
            } as any);
            await this.txRepo.save(tx);
        }

        // 6. Seed Service Prices
        const services = ['Consultation', 'Home Visit', 'Lab Test', 'Ambulance'];
        for (const s of services) {
            const price = this.priceRepo.create({
                serviceName: s,
                amount: parseFloat(faker.finance.amount({ min: 1000, max: 10000, dec: 2 })),
                currency: 'KES',
            });
            await this.priceRepo.save(price);
        }

        return { message: 'Seeding complete', counts: { patients: 10, doctors: 10, appointments: 15, records: 12, transactions: 20 } };
    }
}
