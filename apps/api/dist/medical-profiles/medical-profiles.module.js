"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalProfilesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const medical_profile_entity_1 = require("./entities/medical-profile.entity");
const medical_profiles_service_1 = require("./medical-profiles.service");
const medical_profiles_controller_1 = require("./medical-profiles.controller");
const users_module_1 = require("../users/users.module");
let MedicalProfilesModule = class MedicalProfilesModule {
};
exports.MedicalProfilesModule = MedicalProfilesModule;
exports.MedicalProfilesModule = MedicalProfilesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([medical_profile_entity_1.MedicalProfile]), users_module_1.UsersModule],
        controllers: [medical_profiles_controller_1.MedicalProfilesController],
        providers: [medical_profiles_service_1.MedicalProfilesService],
        exports: [medical_profiles_service_1.MedicalProfilesService],
    })
], MedicalProfilesModule);
//# sourceMappingURL=medical-profiles.module.js.map