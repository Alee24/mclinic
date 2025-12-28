import { Repository } from 'typeorm';
import { Medication } from './entities/medication.entity';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { PharmacyOrder, OrderStatus, PaymentMethod } from './entities/pharmacy-order.entity';
import { DoctorsService } from '../doctors/doctors.service';
import { FinancialService } from '../financial/financial.service';
export declare class PharmacyService {
    private medicationRepo;
    private prescriptionRepo;
    private prescriptionItemRepo;
    private pharmacyOrderRepo;
    private readonly doctorsService;
    private readonly financialService;
    constructor(medicationRepo: Repository<Medication>, prescriptionRepo: Repository<Prescription>, prescriptionItemRepo: Repository<PrescriptionItem>, pharmacyOrderRepo: Repository<PharmacyOrder>, doctorsService: DoctorsService, financialService: FinancialService);
    findAllMedications(): Promise<Medication[]>;
    findMedicationById(id: number): Promise<Medication | null>;
    createMedication(data: Partial<Medication>): Promise<Medication>;
    createPrescription(data: {
        doctorId: number;
        patientId: number;
        appointmentId?: number;
        notes?: string;
        items: {
            medicationId?: number;
            medicationName: string;
            quantity: number;
            dosage?: string;
            frequency?: string;
            duration?: string;
            instructions?: string;
        }[];
    }): Promise<Prescription | null>;
    findPrescriptionById(id: number): Promise<Prescription | null>;
    findPrescriptionsByAppointment(appointmentId: number): Promise<Prescription[]>;
    getPatientPrescriptions(patientId: number): Promise<Prescription[]>;
    getDoctorPrescriptions(doctorId: number): Promise<Prescription[]>;
    getAllPrescriptions(): Promise<Prescription[]>;
    updatePrescriptionStatus(id: number, status: PrescriptionStatus): Promise<Prescription>;
    createOrder(data: {
        userId: number;
        prescriptionId?: string;
        deliveryAddress: string;
        deliveryCity: string;
        contactPhone: string;
        paymentMethod: PaymentMethod;
        items: {
            medicationId: string;
            quantity: number;
        }[];
    }): Promise<PharmacyOrder>;
    getUserOrders(userId: number | string): Promise<PharmacyOrder[]>;
    getAllOrders(): Promise<PharmacyOrder[]>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<import("typeorm").UpdateResult>;
}
