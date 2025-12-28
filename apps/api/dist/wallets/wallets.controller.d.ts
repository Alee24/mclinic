import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    getBalance(req: any): Promise<import("./entities/wallet.entity").Wallet>;
}
