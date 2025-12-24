import { User } from '../../users/entities/user.entity';
export declare class Wallet {
    id: number;
    user_id: number;
    user: User;
    balance: number;
}
