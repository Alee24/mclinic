import { InvoiceItem } from './invoice-item.entity';
export declare enum InvoiceStatus {
    PENDING = "pending",
    PAID = "paid",
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
    createdAt: Date;
    updatedAt: Date;
}
