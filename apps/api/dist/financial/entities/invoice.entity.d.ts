import { InvoiceItem } from './invoice-item.entity';
export declare enum InvoiceStatus {
    PENDING = "pending",
    PAID = "paid",
    OVERDUE = "overdue",
    CANCELLED = "cancelled"
}
export declare class Invoice {
    id: number;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: InvoiceStatus;
    dueDate: Date;
    items: InvoiceItem[];
    customerMobile: string;
    paymentMethod: string;
    doctorId: number;
    commissionAmount: number;
    createdAt: Date;
    updatedAt: Date;
    appointmentId: number;
    appointment: any;
}
