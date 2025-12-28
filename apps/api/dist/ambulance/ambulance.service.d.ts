import { Repository } from 'typeorm';
import { AmbulancePackage } from './entities/ambulance-package.entity';
import { AmbulanceSubscription } from './entities/ambulance-subscription.entity';
import { FinancialService } from '../financial/financial.service';
export declare class AmbulanceService {
    private repo;
    private packageRepo;
    private financialService;
    constructor(repo: Repository<AmbulanceSubscription>, packageRepo: Repository<AmbulancePackage>, financialService: FinancialService);
    findAllPackages(): Promise<AmbulancePackage[]>;
    createPackage(dto: any): Promise<AmbulancePackage[]>;
    seedPackages(): Promise<void>;
    create(dto: any, userId: number): Promise<{
        subscription: any;
        invoice: import("../financial/entities/invoice.entity").Invoice | null;
    }>;
    findAll(): Promise<AmbulanceSubscription[]>;
    findByUserId(userId: number): Promise<AmbulanceSubscription[]>;
    findOne(id: number): Promise<AmbulanceSubscription | null>;
    updateStatus(id: number, status: string): Promise<AmbulanceSubscription | null>;
}
