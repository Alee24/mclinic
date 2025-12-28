import { PharmacyOrder } from './pharmacy-order.entity';
import { Medication } from './medication.entity';
export declare class PharmacyOrderItem {
    id: string;
    orderId: string;
    order: PharmacyOrder;
    medicationId: string;
    medication: Medication;
    medicationName: string;
    quantity: number;
    price: number;
    subtotal: number;
}
