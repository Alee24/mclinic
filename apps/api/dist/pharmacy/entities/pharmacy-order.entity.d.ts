import { User } from '../../users/entities/user.entity';
import { PharmacyOrderItem } from './pharmacy-order-item.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethod {
    MPESA = "MPESA",
    CARD = "CARD",
    CASH = "CASH",
    INSURANCE = "INSURANCE"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class PharmacyOrder {
    id: string;
    userId: number;
    user: User;
    status: OrderStatus;
    totalAmount: number;
    deliveryAddress: string;
    deliveryCity: string;
    contactPhone: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    transactionId: string;
    prescriptionId: string;
    invoiceId: number;
    invoice: any;
    items: PharmacyOrderItem[];
    createdAt: Date;
    updatedAt: Date;
}
