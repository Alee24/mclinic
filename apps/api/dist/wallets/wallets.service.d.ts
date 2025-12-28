import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../users/entities/user.entity';
export declare class WalletsService {
    private walletsRepository;
    private usersRepository;
    constructor(walletsRepository: Repository<Wallet>, usersRepository: Repository<User>);
    createWallet(userId: number, currency?: string): Promise<Wallet>;
    getBalance(userId: number): Promise<Wallet>;
    credit(userId: number, amount: number, reference: string): Promise<Wallet>;
    debit(userId: number, amount: number, reference: string): Promise<Wallet>;
    creditByEmail(email: string, amount: number, reference: string): Promise<Wallet>;
    debitByEmail(email: string, amount: number, reference: string): Promise<Wallet>;
    getBalanceByEmail(email: string): Promise<Wallet>;
    setBalanceByEmail(email: string, amount: number): Promise<Wallet | undefined>;
}
