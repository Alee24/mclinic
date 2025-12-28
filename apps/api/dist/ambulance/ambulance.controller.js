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
exports.AmbulanceController = void 0;
const common_1 = require("@nestjs/common");
const ambulance_service_1 = require("./ambulance.service");
const passport_1 = require("@nestjs/passport");
let AmbulanceController = class AmbulanceController {
    service;
    constructor(service) {
        this.service = service;
    }
    getPackages() {
        return this.service.findAllPackages();
    }
    createPackage(body) {
        return this.service.createPackage(body);
    }
    create(body, req) {
        return this.service.create(body, req.user.id);
    }
    getMySubscriptions(req) {
        return this.service.findByUserId(req.user.id);
    }
    findOne(id) {
        return this.service.findOne(+id);
    }
};
exports.AmbulanceController = AmbulanceController;
__decorate([
    (0, common_1.Get)('packages'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AmbulanceController.prototype, "getPackages", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('packages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AmbulanceController.prototype, "createPackage", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('subscribe'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AmbulanceController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('my-subscriptions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AmbulanceController.prototype, "getMySubscriptions", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AmbulanceController.prototype, "findOne", null);
exports.AmbulanceController = AmbulanceController = __decorate([
    (0, common_1.Controller)('ambulance'),
    __metadata("design:paramtypes", [ambulance_service_1.AmbulanceService])
], AmbulanceController);
//# sourceMappingURL=ambulance.controller.js.map