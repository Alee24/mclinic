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
exports.MedicalProfilesController = void 0;
const common_1 = require("@nestjs/common");
const medical_profiles_service_1 = require("./medical-profiles.service");
const passport_1 = require("@nestjs/passport");
let MedicalProfilesController = class MedicalProfilesController {
    service;
    constructor(service) {
        this.service = service;
    }
    getProfile(req) {
        return this.service.findByUserId(req.user.id);
    }
    getProfileByUser(userId) {
        return this.service.findByUserId(+userId);
    }
    updateProfile(req, body) {
        return this.service.update(req.user.id, body);
    }
};
exports.MedicalProfilesController = MedicalProfilesController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MedicalProfilesController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MedicalProfilesController.prototype, "getProfileByUser", null);
__decorate([
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], MedicalProfilesController.prototype, "updateProfile", null);
exports.MedicalProfilesController = MedicalProfilesController = __decorate([
    (0, common_1.Controller)('medical-profiles'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [medical_profiles_service_1.MedicalProfilesService])
], MedicalProfilesController);
//# sourceMappingURL=medical-profiles.controller.js.map