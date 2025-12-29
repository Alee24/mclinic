import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MpesaTransaction } from './entities/mpesa-transaction.entity';
export declare class MpesaService {
    private mpesaTransactionRepository;
    private configService;
    private readonly consumerKey;
    private readonly consumerSecret;
    private readonly passkey;
    private readonly shortcode;
    private readonly callbackUrl;
    private readonly environment;
    constructor(mpesaTransactionRepository: Repository<MpesaTransaction>, configService: ConfigService);
    private get baseUrl();
    getAccessToken(): Promise<string>;
    initiateSTKPush(phoneNumber: string, amount: number, accountReference: string, transactionDesc: string, relatedEntity?: string, relatedEntityId?: number): Promise<MpesaTransaction>;
    stkPushQuery(checkoutRequestId: string): Promise<any>;
    handleCallback(callbackData: any): Promise<MpesaTransaction>;
    private parseMpesaDate;
    getTransactionByCheckoutRequestId(checkoutRequestId: string): Promise<MpesaTransaction | null>;
    getAllTransactions(): Promise<MpesaTransaction[]>;
}
