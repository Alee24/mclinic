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
exports.LaboratoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const lab_test_entity_1 = require("./entities/lab-test.entity");
const lab_order_entity_1 = require("./entities/lab-order.entity");
const lab_result_entity_1 = require("./entities/lab-result.entity");
const user_entity_1 = require("../users/entities/user.entity");
let LaboratoryService = class LaboratoryService {
    testRepo;
    orderRepo;
    resultRepo;
    constructor(testRepo, orderRepo, resultRepo) {
        this.testRepo = testRepo;
        this.orderRepo = orderRepo;
        this.resultRepo = resultRepo;
    }
    async getTests() {
        return this.testRepo.find({ where: { isActive: true } });
    }
    async createTest(data) {
        const test = this.testRepo.create(data);
        return this.testRepo.save(test);
    }
    async createOrder(patientId, testId) {
        const order = this.orderRepo.create({
            patient_id: patientId,
            test_id: testId,
            status: lab_order_entity_1.OrderStatus.PENDING
        });
        return this.orderRepo.save(order);
    }
    async getOrders(user) {
        if (user.role === user_entity_1.UserRole.PATIENT) {
            return this.orderRepo.find({
                where: { patient_id: user.id },
                relations: ['test', 'results'],
                order: { createdAt: 'DESC' }
            });
        }
        return this.orderRepo.find({
            relations: ['test', 'patient'],
            order: { createdAt: 'DESC' }
        });
    }
    async getOrderById(id) {
        return this.orderRepo.findOne({
            where: { id },
            relations: ['test', 'patient', 'results']
        });
    }
    async updateStatus(id, status) {
        await this.orderRepo.update(id, { status });
        const order = await this.getOrderById(id);
        return order;
    }
    async addResults(orderId, results) {
        const order = await this.getOrderById(orderId);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const savedResults = [];
        for (const item of results) {
            const res = this.resultRepo.create({
                ...item,
                order_id: orderId
            });
            savedResults.push(await this.resultRepo.save(res));
        }
        return savedResults;
    }
};
exports.LaboratoryService = LaboratoryService;
exports.LaboratoryService = LaboratoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lab_test_entity_1.LabTest)),
    __param(1, (0, typeorm_1.InjectRepository)(lab_order_entity_1.LabOrder)),
    __param(2, (0, typeorm_1.InjectRepository)(lab_result_entity_1.LabResult)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LaboratoryService);
//# sourceMappingURL=laboratory.service.js.map