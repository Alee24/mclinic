import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class WalletsService {
    constructor(
        @InjectRepository(Wallet)
        private walletsRepository: Repository<Wallet>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async createWallet(userId: number, currency = 'KES') {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        // Check if exists
        const existing = await this.walletsRepository.findOne({
            where: { user: { id: userId } },
        });
        if (existing) return existing;

        const wallet = this.walletsRepository.create({
            user,
            currency,
            balance: 0,
        });
        return this.walletsRepository.save(wallet);
    }

    async getBalance(userId: number) {
        let wallet = await this.walletsRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!wallet) {
            // Auto-create wallet if missing for valid user/doctor
            wallet = await this.createWallet(userId);
        }

        return wallet;
    }

    async credit(userId: number, amount: number, reference: string) {
        const wallet = await this.getBalance(userId);
        wallet.balance = Number(wallet.balance) + Number(amount);
        return this.walletsRepository.save(wallet);
    }

    async debit(userId: number, amount: number, reference: string) {
        const wallet = await this.getBalance(userId);
        if (Number(wallet.balance) < Number(amount)) {
            throw new BadRequestException('Insufficient wallet funds');
        }
        wallet.balance = Number(wallet.balance) - Number(amount);
        return this.walletsRepository.save(wallet);
    }

    async creditByEmail(email: string, amount: number, reference: string) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found for wallet credit.`);
        }
        return this.credit(user.id, amount, reference);
    }

    async debitByEmail(email: string, amount: number, reference: string) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException(`User with email ${email} not found for wallet debit.`);
        return this.debit(user.id, amount, reference);
    }

    async getBalanceByEmail(email: string) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException(`User with email ${email} not found.`);
        return this.getBalance(user.id);
    }

    async setBalanceByEmail(email: string, amount: number) {
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) return;
        const wallet = await this.getBalance(user.id);
        wallet.balance = amount;
        return this.walletsRepository.save(wallet);
    }
}
