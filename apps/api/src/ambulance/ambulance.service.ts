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
                name: 'Individual Plan',
                description: 'Full coverage for one person for one year.',
                price: 2500,
                validity_days: 365,
                max_adults: 1,
                max_children: 0,
                features: ['Air Evacuation', 'Ground Ambulance', '24/7 Support'],
            },
            {
                name: 'Family Plan',
                description: 'Coverage for parents and up to 4 children.',
                price: 6000,
                validity_days: 365,
                max_adults: 2,
                max_children: 4,
                features: ['Air Evacuation', 'Ground Ambulance', 'Home Medical Support'],
            },
            {
                name: 'Parents Package', // Mom & Dad
                description: 'Specialized coverage for elderly parents.',
                price: 5000,
                validity_days: 365,
                max_adults: 2,
                max_children: 0,
                features: ['Geriatric Care Transport', 'Priority Dispatch'],
            },
        ];
        for (const p of packages) {
            await this.packageRepo.save(this.packageRepo.create(p));
        }
    }

    async create(dto: any, userId: number) {
        // userId might come from the logged-in user
        const subscription = this.repo.create({
            ...dto,
            user_id: userId,
            status: 'pending_payment',
            start_date: new Date().toISOString(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // 1 year sub
        });
        const savedSub = await this.repo.save(subscription) as any;

        // integrated payment: create invoice
        const pkg = await this.packageRepo.findOne({ where: { name: dto.package_type } });
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
                    unitPrice: Number(pkg.price)
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
