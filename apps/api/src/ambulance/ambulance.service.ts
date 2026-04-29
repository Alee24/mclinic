import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AmbulancePackage } from './entities/ambulance-package.entity';
import { AmbulanceSubscription } from './entities/ambulance-subscription.entity';

import { FinancialService } from '../financial/financial.service';

@Injectable()
export class AmbulanceService {
    constructor(
        @InjectRepository(AmbulanceSubscription)
        private repo: Repository<AmbulanceSubscription>,
        @InjectRepository(AmbulancePackage)
        private packageRepo: Repository<AmbulancePackage>,
        private financialService: FinancialService,
    ) { }

    async findAllPackages() {
        // Simple seed check
        const count = await this.packageRepo.count();
        if (count === 0) {
            await this.seedPackages();
        }
        return this.packageRepo.find();
    }

    async createPackage(dto: any) {
        const pkg = this.packageRepo.create(dto);
        return this.packageRepo.save(pkg);
    }

    async seedPackages() {
        const packages = [
            {
                name: 'Individual Subscription',
                description: 'Full coverage for one person for one year.',
                price: 3000,
                commission: 3000,
                validity_days: 365,
                max_adults: 1,
                max_children: 0,
                features: ['Air Evacuation', 'Ground Ambulance', '24/7 Support'],
            },
            {
                name: 'Family Package',
                description: 'Coverage for parents and up to 4 children.',
                price: 6000,
                commission: 6000,
                validity_days: 365,
                max_adults: 2,
                max_children: 4,
                features: ['Air Evacuation', 'Ground Ambulance', 'Home Medical Support'],
            },
            {
                name: 'Parents Package',
                description: 'Specialized coverage for elderly parents.',
                price: 2500,
                commission: 2500,
                validity_days: 365,
                max_adults: 2,
                max_children: 0,
                features: ['Geriatric Care Transport', 'Priority Dispatch'],
            },
            {
                name: 'Students Package',
                description: 'Coverage for students (min 150 students).',
                price: 800,
                commission: 800,
                validity_days: 365,
                is_group_package: true,
                min_members: 150,
                features: ['Emergency Campus Dispatch', 'Sporting Event Support'],
            },
            {
                name: 'Corporate Package',
                description: 'Coverage for company members (min 150 members).',
                price: 700,
                commission: 700,
                validity_days: 365,
                is_group_package: true,
                min_members: 150,
                features: ['Workplace Emergency Resp', 'Executive Transport'],
            },
            {
                name: 'Instant Dispatch',
                description: 'Immediate one-off emergency ambulance dispatch.',
                price: 7000,
                commission: 8000,
                validity_days: 1,
                features: ['Immediate Response', 'Advanced Life Support'],
            },
        ];
        for (const p of packages) {
            // Use findOne to avoid duplicates since we use names
            let existing = await this.packageRepo.findOne({ where: { name: p.name } });
            if (existing) {
                Object.assign(existing, p);
                await this.packageRepo.save(existing);
            } else {
                await this.packageRepo.save(this.packageRepo.create(p));
            }
        }
    }

    async create(dto: any, userId: number) {
        const pkg = await this.packageRepo.findOne({ where: { name: dto.package_type } });
        
        let price = 0;
        let commission = 0;
        let total = 0;

        if (pkg) {
            price = Number(pkg.price);
            commission = Number(pkg.commission);
            total = price + commission;
        }

        const subscription = this.repo.create({
            ...dto,
            user_id: userId,
            status: 'pending_payment',
            price,
            commission,
            total_amount: total,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        });
        
        const savedSub = await this.repo.save(subscription) as any;

        // integrated payment: create invoice
        let invoice = null;
        if (pkg) {
            invoice = await this.financialService.createInvoice({
                customerName: dto.primary_subscriber_name || 'Ambulance Subscriber',
                customerEmail: dto.email,
                dueDate: new Date(),
                invoiceNumber: `AMB-SUB-${savedSub.id}-${Date.now().toString().slice(-6)}`,
                items: [{
                    description: `Ambulance Subscription - ${pkg.name}`,
                    quantity: 1,
                    unitPrice: total // Show total charge to the patient
                }]
            });
        }

        return { subscription: savedSub, invoice };
    }

    async findAll() {
        return this.repo.find();
    }

    async findByUserId(userId: number) {
        return this.repo.find({ where: { user_id: userId } });
    }

    async findOne(id: number) {
        return this.repo.findOne({ where: { id } });
    }

    async updateStatus(id: number, status: string) {
        await this.repo.update(id, { status });
        return this.findOne(id);
    }
}
