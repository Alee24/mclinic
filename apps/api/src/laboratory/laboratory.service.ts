import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabTest } from './entities/lab-test.entity';
import { LabOrder, OrderStatus } from './entities/lab-order.entity';
import { LabResult } from './entities/lab-result.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class LaboratoryService {
    constructor(
        @InjectRepository(LabTest) private testRepo: Repository<LabTest>,
        @InjectRepository(LabOrder) private orderRepo: Repository<LabOrder>,
        @InjectRepository(LabResult) private resultRepo: Repository<LabResult>,
    ) { }

    // --- Tests Catalog ---
    async getTests() {
        return this.testRepo.find({ where: { isActive: true } });
    }

    async createTest(data: Partial<LabTest>) {
        const test = this.testRepo.create(data);
        return this.testRepo.save(test);
    }

    // --- Orders ---
    async createOrder(patientId: number, testId: number) {
        // Here you might check if patient exists, or just rely on FK
        const order = this.orderRepo.create({
            patient_id: patientId,
            test_id: testId,
            status: OrderStatus.PENDING
        });
        return this.orderRepo.save(order);
    }

    async getOrders(user: User) {
        if (user.role === UserRole.PATIENT) {
            return this.orderRepo.find({
                where: { patient_id: user.id },
                relations: ['test', 'results'],
                order: { createdAt: 'DESC' }
            });
        }
        // Admin / Lab Tech sees all
        // Should probably filter by status or paginate in real app
        return this.orderRepo.find({
            relations: ['test', 'patient'],
            order: { createdAt: 'DESC' }
        });
    }

    async getOrderById(id: string) {
        return this.orderRepo.findOne({
            where: { id },
            relations: ['test', 'patient', 'results']
        });
    }

    async updateStatus(id: string, status: OrderStatus) {
        await this.orderRepo.update(id, { status });
        const order = await this.getOrderById(id);

        // TODO: Trigger Notification (Email/SMS) based on status change
        // if (status === OrderStatus.SAMPLE_RECEIVED) ...

        return order;
    }

    // --- Results ---
    async addResults(orderId: string, results: Partial<LabResult>[]) {
        const order = await this.getOrderById(orderId);
        if (!order) throw new NotFoundException('Order not found');

        const savedResults = [];
        for (const item of results) {
            const res = this.resultRepo.create({
                ...item,
                order_id: orderId
            });
            savedResults.push(await this.resultRepo.save(res));
        }

        // Auto-update status to COMPLETED if results are added? 
        // Or keep separate step? Usually separate Validation step.

        return savedResults;
    }
}
