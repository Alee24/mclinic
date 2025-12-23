import { User } from '../../users/entities/user.entity';
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class Transaction {
    id: number;
    transactionReference: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    provider: string;
    metadata: string;
    userId: number;
    user: User;
    createdAt: Date;
}
