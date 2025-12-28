"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaboratoryModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const laboratory_service_1 = require("./laboratory.service");
const laboratory_controller_1 = require("./laboratory.controller");
const lab_test_entity_1 = require("./entities/lab-test.entity");
const lab_order_entity_1 = require("./entities/lab-order.entity");
const lab_result_entity_1 = require("./entities/lab-result.entity");
const user_entity_1 = require("../users/entities/user.entity");
let LaboratoryModule = class LaboratoryModule {
};
exports.LaboratoryModule = LaboratoryModule;
exports.LaboratoryModule = LaboratoryModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([lab_test_entity_1.LabTest, lab_order_entity_1.LabOrder, lab_result_entity_1.LabResult, user_entity_1.User])],
        controllers: [laboratory_controller_1.LaboratoryController],
        providers: [laboratory_service_1.LaboratoryService],
    })
], LaboratoryModule);
//# sourceMappingURL=laboratory.module.js.map