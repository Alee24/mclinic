import { User } from '../../users/entities/user.entity';
import { Invoice } from './invoice.entity';
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    SUCCESS = "success",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class Transaction {
    id: number;
    reference: string;
    amount: number;
    type: string;
    source: string;
    status: TransactionStatus;
    userId: number;
    user: User;
    invoiceId: number;
    invoice: Invoice;
    createdAt: Date;
}
