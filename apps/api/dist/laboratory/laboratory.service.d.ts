import { Repository } from 'typeorm';
import { LabTest } from './entities/lab-test.entity';
import { LabOrder, OrderStatus } from './entities/lab-order.entity';
import { LabResult } from './entities/lab-result.entity';
import { User } from '../users/entities/user.entity';
export declare class LaboratoryService {
    private testRepo;
    private orderRepo;
    private resultRepo;
    constructor(testRepo: Repository<LabTest>, orderRepo: Repository<LabOrder>, resultRepo: Repository<LabResult>);
    getTests(): Promise<LabTest[]>;
    createTest(data: Partial<LabTest>): Promise<LabTest>;
    createOrder(patientId: number, testId: number): Promise<LabOrder>;
    getOrders(user: User): Promise<LabOrder[]>;
    getOrderById(id: string): Promise<LabOrder | null>;
    updateStatus(id: string, status: OrderStatus): Promise<LabOrder | null>;
    addResults(orderId: string, results: Partial<LabResult>[]): Promise<LabResult[]>;
}
