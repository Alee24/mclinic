import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
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
        try {
            // 0. CLEAR DATA
            await this.txRepo.delete({ id: MoreThanOrEqual(0) });
            await this.recordRepo.delete({ id: MoreThanOrEqual(0) });
            await this.appointmentRepo.delete({ id: MoreThanOrEqual(0) });
            await this.doctorRepo.delete({ id: MoreThanOrEqual(0) });
            await this.patientRepo.delete({ id: MoreThanOrEqual(0) });
            await this.priceRepo.delete({ id: MoreThanOrEqual(0) });
            await this.userRepo.delete({ id: MoreThanOrEqual(0) });
            // await this.locationRepo.delete({}); // If injected
            // await this.departmentRepo.delete({}); // If injected
            // await this.specialityRepo.delete({}); // If injected

            console.log('Cleared all data');

            // 1. Seed Patients
            const patients = [];

            // Create Specific Test Account
            const testPassword = await bcrypt.hash('Digital2025', 10);
            const testUser = this.userRepo.create({
                email: 'mettoalex@gmail.com',
                password: testPassword,
                role: UserRole.PATIENT,
                status: true,
                emailVerifiedAt: new Date(),
            });
            await this.userRepo.save(testUser);

            const testPatient = this.patientRepo.create({
                user: testUser,
                fname: 'Alex',
                lname: 'Metto',
                dob: '1990-01-01',
                sex: 'Male',
                mobile: '0700000000',
                address: 'Test Address, Nairobi',
            } as any);
            patients.push(await this.patientRepo.save(testPatient));
            console.log('Created Test Account: mettoalex@gmail.com / Digital2025');

            // Create Admin Account (sadmin)
            const adminPassword = await bcrypt.hash('Digital2025', 10);
            const adminUser = this.userRepo.create({
                email: 'sadmin@mclinic.com',
                password: adminPassword,
                role: UserRole.ADMIN,
                status: true,
                emailVerifiedAt: new Date(),
            });
            await this.userRepo.save(adminUser);
            console.log('Created Admin Account: sadmin@mclinic.com / Digital2025');

            for (let i = 0; i < 10; i++) {
                const email = faker.internet.email();
                const password = await bcrypt.hash('password123', 10);

                const user = this.userRepo.create({
                    email,
                    password,
                    role: UserRole.PATIENT,
                    status: true,
                    emailVerifiedAt: new Date(),
                });
                await this.userRepo.save(user);

                const patient = this.patientRepo.create({
                    user,
                    fname: faker.person.firstName(),
                    lname: faker.person.lastName(),
                    dob: faker.date.birthdate().toISOString().split('T')[0],
                    sex: faker.person.sex(),
                    mobile: faker.phone.number(),
                    address: faker.location.streetAddress(),
                    emergencyContactPhone: faker.phone.number(),
                } as any);
                patients.push(await this.patientRepo.save(patient));
            }

            // 2. Seed Doctors
            const doctors: any[] = [];
            for (let i = 0; i < 10; i++) {
                const email = faker.internet.email();
                const password = await bcrypt.hash('password123', 10);

                const user = this.userRepo.create({
                    email,
                    password,
                    role: UserRole.DOCTOR,
                    status: true,
                    emailVerifiedAt: new Date(),
                });
                await this.userRepo.save(user);

                const doctor = this.doctorRepo.create({
                    user,
                    fname: faker.person.firstName(),
                    lname: faker.person.lastName(),
                    dr_type: faker.person.jobTitle(), // 'Nurse', 'Cardiologist' etc
                    mobile: faker.phone.number(),
                    verified_status: faker.datatype.boolean(),
                    latitude: -1.286389 + (Math.random() - 0.5) * 0.1, // Nairobi
                    longitude: 36.817223 + (Math.random() - 0.5) * 0.1,
                    isWorking: Math.random() > 0.3,
                    balance: parseFloat(faker.finance.amount({ min: 0, max: 10000, dec: 2 })),
                    fee: parseFloat(faker.finance.amount({ min: 500, max: 5000, dec: 0 })),
                    qualification: 'MBBS, PhD',
                    about: faker.lorem.paragraph(),
                } as any);
                doctors.push(await this.doctorRepo.save(doctor));
            }

            // 3. Seed Appointments
            for (let i = 0; i < 20; i++) {
                const patient = faker.helpers.arrayElement(patients);
                const doctor = faker.helpers.arrayElement(doctors);
                const futureDate = faker.date.future();

                const apt: any = this.appointmentRepo.create({
                    patient,
                    doctor,
                    appointment_date: futureDate,
                    appointment_time: futureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    fee: doctor.fee || 1500,
                    status: faker.helpers.arrayElement([
                        AppointmentStatus.PENDING,
                        AppointmentStatus.CONFIRMED,
                        AppointmentStatus.COMPLETED
                    ]),
                    notes: faker.lorem.sentence(),
                } as any);

                // Generate link if needed
                if (Math.random() > 0.8) {
                    const mid = `mclinic-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    apt.meetingId = mid;
                    apt.meetingLink = `https://meet.jit.si/${mid}`;
                }

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
                } as any);
                await this.recordRepo.save(record);
            }

            // 5. Seed Transactions (Updated Schema)
            const allUsers = await this.userRepo.find();
            for (let i = 0; i < 30; i++) {
                const randomUser = faker.helpers.arrayElement(allUsers);
                const isCredit = Math.random() > 0.5;

                const tx = this.txRepo.create({
                    user: randomUser,
                    amount: parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 })),
                    type: isCredit ? 'credit' : 'debit',
                    source: faker.helpers.arrayElement(['MPESA', 'VISA', 'CASH']),
                    status: faker.helpers.arrayElement([
                        TransactionStatus.SUCCESS,
                        TransactionStatus.PENDING,
                        TransactionStatus.FAILED
                    ]),
                    reference: faker.string.alphanumeric(10).toUpperCase(),
                } as any);
                await this.txRepo.save(tx);
            }

            // 6. Seed Service Prices
            const services = ['Consultation', 'Home Visit', 'Lab Test', 'Ambulance', 'Dental Checkup', 'Video Consult'];
            for (const s of services) {
                const price = this.priceRepo.create({
                    serviceName: s,
                    amount: parseFloat(faker.finance.amount({ min: 1000, max: 10000, dec: 2 })),
                    currency: 'KES',
                });
                await this.priceRepo.save(price);
            }

            return { message: 'Database cleared and re-seeded successfully with updated schema.', counts: { patients: 10, doctors: 10, appointments: 20, records: 12, transactions: 30 } };

        } catch (error) {
            console.error('SEEDING ERROR:', error);
            throw new InternalServerErrorException(`Seeding failed: ${error.message}`);
        }
    }
}
