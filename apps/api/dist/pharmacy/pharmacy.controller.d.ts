import { PharmacyService } from './pharmacy.service';
import { PrescriptionStatus } from './entities/prescription.entity';
export declare class PharmacyController {
    private readonly pharmacyService;
    constructor(pharmacyService: PharmacyService);
    getAllMedications(): Promise<import("./entities/medication.entity").Medication[]>;
    createMedication(body: any): Promise<import("./entities/medication.entity").Medication>;
    createPrescription(body: any): Promise<import("./entities/prescription.entity").Prescription | null>;
    getAllPrescriptions(): Promise<import("./entities/prescription.entity").Prescription[]>;
    getPatientPrescriptions(id: string): Promise<import("./entities/prescription.entity").Prescription[]>;
    getDoctorPrescriptions(id: string): Promise<import("./entities/prescription.entity").Prescription[]>;
    getPrescription(id: string): Promise<import("./entities/prescription.entity").Prescription | null>;
    getAppointmentPrescriptions(id: string): Promise<import("./entities/prescription.entity").Prescription[]>;
    updateStatus(id: string, status: PrescriptionStatus): Promise<import("./entities/prescription.entity").Prescription>;
    createOrder(body: any): Promise<import("./entities/pharmacy-order.entity").PharmacyOrder>;
    getUserOrders(userId: string): Promise<import("./entities/pharmacy-order.entity").PharmacyOrder[]>;
    getAllOrders(): Promise<import("./entities/pharmacy-order.entity").PharmacyOrder[]>;
    updateOrderStatus(id: string, status: any): Promise<import("typeorm").UpdateResult>;
}
