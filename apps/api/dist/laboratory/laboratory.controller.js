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
exports.LaboratoryController = void 0;
const common_1 = require("@nestjs/common");
const laboratory_service_1 = require("./laboratory.service");
const passport_1 = require("@nestjs/passport");
const user_entity_1 = require("../users/entities/user.entity");
let LaboratoryController = class LaboratoryController {
    labService;
    constructor(labService) {
        this.labService = labService;
    }
    getTests() {
        return this.labService.getTests();
    }
    createTest(body) {
        return this.labService.createTest(body);
    }
    createOrder(req, body) {
        const patientId = req.user.role === user_entity_1.UserRole.PATIENT ? req.user.id : body['patientId'];
        return this.labService.createOrder(patientId, body.testId);
    }
    getOrders(req) {
        return this.labService.getOrders(req.user);
    }
    getOrder(id) {
        return this.labService.getOrderById(id);
    }
    updateStatus(id, body) {
        return this.labService.updateStatus(id, body.status);
    }
    addResults(id, body) {
        return this.labService.addResults(id, body.results);
    }
};
exports.LaboratoryController = LaboratoryController;
__decorate([
    (0, common_1.Get)('tests'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "getTests", null);
__decorate([
    (0, common_1.Post)('tests'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "createTest", null);
__decorate([
    (0, common_1.Post)('orders'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('orders/:id/results'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LaboratoryController.prototype, "addResults", null);
exports.LaboratoryController = LaboratoryController = __decorate([
    (0, common_1.Controller)('laboratory'),
    __metadata("design:paramtypes", [laboratory_service_1.LaboratoryService])
], LaboratoryController);
//# sourceMappingURL=laboratory.controller.js.map