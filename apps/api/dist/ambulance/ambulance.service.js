"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmbulanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ambulance_package_entity_1 = require("./entities/ambulance-package.entity");
const ambulance_subscription_entity_1 = require("./entities/ambulance-subscription.entity");
const financial_service_1 = require("../financial/financial.service");
let AmbulanceService = class AmbulanceService {
    repo;
    packageRepo;
    financialService;
    constructor(repo, packageRepo, financialService) {
        this.repo = repo;
        this.packageRepo = packageRepo;
        this.financialService = financialService;
    }
    async findAllPackages() {
        const count = await this.packageRepo.count();
        if (count === 0) {
            await this.seedPackages();
        }
        return this.packageRepo.find();
    }
    async createPackage(dto) {
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
                name: 'Parents Package',
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
    async create(dto, userId) {
        const subscription = this.repo.create({
            ...dto,
            user_id: userId,
            status: 'pending_payment',
            start_date: new Date().toISOString(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        });
        const savedSub = await this.repo.save(subscription);
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
    async findByUserId(userId) {
        return this.repo.find({ where: { user_id: userId } });
    }
    async findOne(id) {
        return this.repo.findOne({ where: { id } });
    }
    async updateStatus(id, status) {
        await this.repo.update(id, { status });
        return this.findOne(id);
    }
};
exports.AmbulanceService = AmbulanceService;
exports.AmbulanceService = AmbulanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ambulance_subscription_entity_1.AmbulanceSubscription)),
    __param(1, (0, typeorm_1.InjectRepository)(ambulance_package_entity_1.AmbulancePackage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        financial_service_1.FinancialService])
], AmbulanceService);
//# sourceMappingURL=ambulance.service.js.map