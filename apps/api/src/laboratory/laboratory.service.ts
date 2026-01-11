import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabTest } from './entities/lab-test.entity';
import { LabOrder, OrderStatus } from './entities/lab-order.entity';
import { LabResult } from './entities/lab-result.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class LaboratoryService {
    constructor(
        @InjectRepository(LabTest) private testRepo: Repository<LabTest>,
        @InjectRepository(LabOrder) private orderRepo: Repository<LabOrder>,
        @InjectRepository(LabResult) private resultRepo: Repository<LabResult>,
        private emailService: EmailService,
    ) { }

    async uploadReport(orderId: string, filename: string, notes?: string) {
        await this.orderRepo.update(orderId, {
            report_url: filename,
            technicianNotes: notes,
            status: OrderStatus.COMPLETED
        });

        const order = await this.getOrderById(orderId);

        if (order && order.patient) {
            await this.emailService.sendLabResultsReadyEmail(order.patient, order, order.test?.name);
        }

        return order;
    }

    // --- Tests Catalog ---
    async getTests() {
        return this.testRepo.find({ where: { isActive: true } });
    }

    async createTest(data: Partial<LabTest>) {
        const test = this.testRepo.create(data);
        return this.testRepo.save(test);
    }

    // --- Orders ---
    async createOrder(patientId: number, testId: number, beneficiaryData?: any) {
        const order = this.orderRepo.create({
            patient_id: patientId,
            test_id: testId,
            status: OrderStatus.PENDING,
            isForSelf: beneficiaryData?.isForSelf ?? true,
            beneficiaryName: beneficiaryData?.beneficiaryName,
            beneficiaryAge: beneficiaryData?.beneficiaryAge,
            beneficiaryGender: beneficiaryData?.beneficiaryGender,
            beneficiaryRelation: beneficiaryData?.beneficiaryRelation,
            sample_collection_date: beneficiaryData?.sampleDate ? new Date(beneficiaryData.sampleDate) : undefined
        });
        return this.orderRepo.save(order);
    }

    async seedTests() {
        // Only seed if empty
        const count = await this.testRepo.count();
        if (count > 0) return;

        const commonTests = [
            { name: 'Full Hemogram', category: 'Hematology', price: 800, description: 'Complete Blood Count (CBC) including HB, WBC, Platelets' },
            { name: 'Malaria Parasite (BS)', category: 'Microbiology', price: 300, description: 'Blood smear for Malaria Parasite detection' },
            { name: 'Urinalysis', category: 'Microbiology', price: 400, description: 'Physical, Chemical and Microscopic examination of urine' },
            { name: 'UECs', category: 'Biochemistry', price: 2500, description: 'Urea, Electrolytes and Creatinine - Kidney Function Test' },
            { name: 'Liver Function Test', category: 'Biochemistry', price: 3000, description: 'AST, ALT, ALP, GGT, Total Protein, Albumin, Bilirubin' },
            { name: 'Lipid Profile', category: 'Biochemistry', price: 2800, description: 'Cholesterol (Total, HDL, LDL), Triglycerides' },
            { name: 'Blood Sugar (Random)', category: 'Biochemistry', price: 200, description: 'Random Blood Glucose test' },
            { name: 'Blood Sugar (Fasting)', category: 'Biochemistry', price: 200, description: 'Fasting Blood Glucose test' },
            { name: 'H. Pylori Antigen', category: 'Microbiology', price: 1200, description: 'Stool antigen test for H. Pylori' },
            { name: 'Thyroid Profile', category: 'Immunology', price: 4500, description: 'T3, T4, TSH levels' },
            { name: 'Vitamin D', category: 'Biochemistry', price: 3500, description: '25-Hydroxy Vitamin D level' },
            { name: 'Pregnancy Test (Urine)', category: 'Other', price: 500, description: 'Urine hCG test' },
        ];

        for (const t of commonTests) {
            // @ts-ignore
            await this.testRepo.save(this.testRepo.create(t));
        }
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
