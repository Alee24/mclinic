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
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
const user_entity_1 = require("../users/entities/user.entity");
let WalletsService = class WalletsService {
    walletsRepository;
    usersRepository;
    constructor(walletsRepository, usersRepository) {
        this.walletsRepository = walletsRepository;
        this.usersRepository = usersRepository;
    }
    async createWallet(userId, currency = 'KES') {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.walletsRepository.findOne({
            where: { user: { id: userId } },
        });
        if (existing)
            return existing;
        const wallet = this.walletsRepository.create({
            user,
            currency,
            balance: 0,
        });
        return this.walletsRepository.save(wallet);
    }
    async getBalance(userId) {
        let wallet = await this.walletsRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!wallet) {
            wallet = await this.createWallet(userId);
        }
        return wallet;
    }
    async credit(userId, amount, reference) {
        const wallet = await this.getBalance(userId);
        wallet.balance = Number(wallet.balance) + Number(amount);
        return this.walletsRepository.save(wallet);
    }
    async debit(userId, amount, reference) {
        const wallet = await this.getBalance(userId);
        if (Number(wallet.balance) < Number(amount)) {
            throw new common_1.BadRequestException('Insufficient wallet funds');
        }
        wallet.balance = Number(wallet.balance) - Number(amount);
        return this.walletsRepository.save(wallet);
    }
    async creditByEmail(email, amount, reference) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.NotFoundException(`User with email ${email} not found for wallet credit.`);
        }
        return this.credit(user.id, amount, reference);
    }
    async debitByEmail(email, amount, reference) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException(`User with email ${email} not found for wallet debit.`);
        return this.debit(user.id, amount, reference);
    }
    async getBalanceByEmail(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException(`User with email ${email} not found.`);
        return this.getBalance(user.id);
    }
    async setBalanceByEmail(email, amount) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user)
            return;
        const wallet = await this.getBalance(user.id);
        wallet.balance = amount;
        return this.walletsRepository.save(wallet);
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map