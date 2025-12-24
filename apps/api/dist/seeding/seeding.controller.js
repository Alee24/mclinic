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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedingController = void 0;
const common_1 = require("@nestjs/common");
const seeding_service_1 = require("./seeding.service");
let SeedingController = class SeedingController {
    seedingService;
    constructor(seedingService) {
        this.seedingService = seedingService;
    }
    async runSeeding() {
        return this.seedingService.seedAll();
    }
    async clearData() {
        return this.seedingService.clearAll();
    }
};
exports.SeedingController = SeedingController;
__decorate([
    (0, common_1.Post)('run'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeedingController.prototype, "runSeeding", null);
__decorate([
    (0, common_1.Post)('clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SeedingController.prototype, "clearData", null);
exports.SeedingController = SeedingController = __decorate([
    (0, common_1.Controller)('seeding'),
    __metadata("design:paramtypes", [seeding_service_1.SeedingService])
], SeedingController);
//# sourceMappingURL=seeding.controller.js.map