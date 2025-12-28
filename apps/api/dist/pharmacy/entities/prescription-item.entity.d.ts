import { Prescription } from './prescription.entity';
import { Medication } from './medication.entity';
export declare class PrescriptionItem {
    id: number;
    prescription: Prescription;
    prescriptionId: number;
    medication: Medication;
    medicationId: number;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    instructions: string;
}
