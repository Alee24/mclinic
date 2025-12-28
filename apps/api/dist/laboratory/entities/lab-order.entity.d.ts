import { User } from '../../users/entities/user.entity';
import { LabTest } from './lab-test.entity';
import { LabResult } from './lab-result.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    SAMPLE_RECEIVED = "sample_received",
    PROCESSING = "processing",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class LabOrder {
    id: string;
    patient: User;
    patient_id: number;
    test: LabTest;
    test_id: number;
    status: OrderStatus;
    sample_collection_date: Date;
    results: LabResult[];
    report_url: string;
    createdAt: Date;
    updatedAt: Date;
}
