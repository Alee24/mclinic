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
exports.LabTest = exports.TestCategory = void 0;
const typeorm_1 = require("typeorm");
var TestCategory;
(function (TestCategory) {
    TestCategory["HEMATOLOGY"] = "Hematology";
    TestCategory["BIOCHEMISTRY"] = "Biochemistry";
    TestCategory["MICROBIOLOGY"] = "Microbiology";
    TestCategory["IMMUNOLOGY"] = "Immunology";
    TestCategory["PATHOLOGY"] = "Pathology";
    TestCategory["RADIOLOGY"] = "Radiology";
    TestCategory["OTHER"] = "Other";
})(TestCategory || (exports.TestCategory = TestCategory = {}));
let LabTest = class LabTest {
    id;
    name;
    description;
    price;
    category;
    isActive;
    createdAt;
    updatedAt;
};
exports.LabTest = LabTest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LabTest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], LabTest.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LabTest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], LabTest.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TestCategory,
        default: TestCategory.OTHER
    }),
    __metadata("design:type", String)
], LabTest.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], LabTest.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LabTest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], LabTest.prototype, "updatedAt", void 0);
exports.LabTest = LabTest = __decorate([
    (0, typeorm_1.Entity)()
], LabTest);
//# sourceMappingURL=lab-test.entity.js.map