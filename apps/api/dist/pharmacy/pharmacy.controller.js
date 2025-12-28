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
exports.PharmacyController = void 0;
const common_1 = require("@nestjs/common");
const pharmacy_service_1 = require("./pharmacy.service");
const prescription_entity_1 = require("./entities/prescription.entity");
let PharmacyController = class PharmacyController {
    pharmacyService;
    constructor(pharmacyService) {
        this.pharmacyService = pharmacyService;
    }
    getAllMedications() {
        return this.pharmacyService.findAllMedications();
    }
    createMedication(body) {
        return this.pharmacyService.createMedication(body);
    }
    createPrescription(body) {
        return this.pharmacyService.createPrescription(body);
    }
    getAllPrescriptions() {
        return this.pharmacyService.getAllPrescriptions();
    }
    getPatientPrescriptions(id) {
        return this.pharmacyService.getPatientPrescriptions(+id);
    }
    getDoctorPrescriptions(id) {
        return this.pharmacyService.getDoctorPrescriptions(+id);
    }
    getPrescription(id) {
        return this.pharmacyService.findPrescriptionById(+id);
    }
    getAppointmentPrescriptions(id) {
        return this.pharmacyService.findPrescriptionsByAppointment(+id);
    }
    updateStatus(id, status) {
        return this.pharmacyService.updatePrescriptionStatus(+id, status);
    }
    createOrder(body) {
        return this.pharmacyService.createOrder(body);
    }
    getUserOrders(userId) {
        return this.pharmacyService.getUserOrders(userId);
    }
    getAllOrders() {
        return this.pharmacyService.getAllOrders();
    }
    updateOrderStatus(id, status) {
        return this.pharmacyService.updateOrderStatus(id, status);
    }
};
exports.PharmacyController = PharmacyController;
__decorate([
    (0, common_1.Get)('medications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getAllMedications", null);
__decorate([
    (0, common_1.Post)('medications'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "createMedication", null);
__decorate([
    (0, common_1.Post)('prescriptions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "createPrescription", null);
__decorate([
    (0, common_1.Get)('prescriptions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getAllPrescriptions", null);
__decorate([
    (0, common_1.Get)('prescriptions/patient/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getPatientPrescriptions", null);
__decorate([
    (0, common_1.Get)('prescriptions/doctor/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getDoctorPrescriptions", null);
__decorate([
    (0, common_1.Get)('prescriptions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getPrescription", null);
__decorate([
    (0, common_1.Get)('prescriptions/appointment/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getAppointmentPrescriptions", null);
__decorate([
    (0, common_1.Patch)('prescriptions/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getUserOrders", null);
__decorate([
    (0, common_1.Get)('orders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Patch)('orders/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PharmacyController.prototype, "updateOrderStatus", null);
exports.PharmacyController = PharmacyController = __decorate([
    (0, common_1.Controller)('pharmacy'),
    __metadata("design:paramtypes", [pharmacy_service_1.PharmacyService])
], PharmacyController);
//# sourceMappingURL=pharmacy.controller.js.map