import { LabOrder } from './lab-order.entity';
export declare class LabResult {
    id: number;
    order: LabOrder;
    order_id: string;
    parameter_name: string;
    value: string;
    unit: string;
    reference_range: string;
    notes: string;
    is_abnormal: boolean;
    createdAt: Date;
    updatedAt: Date;
}
