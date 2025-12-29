import { MpesaService } from './mpesa.service';
export declare class MpesaController {
    private readonly mpesaService;
    constructor(mpesaService: MpesaService);
    initiateSTKPush(body: any): Promise<import("./entities/mpesa-transaction.entity").MpesaTransaction>;
    handleCallback(callbackData: any): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    queryStatus(checkoutRequestId: string): Promise<any>;
    getTransaction(checkoutRequestId: string): Promise<import("./entities/mpesa-transaction.entity").MpesaTransaction | null>;
    getAllTransactions(): Promise<import("./entities/mpesa-transaction.entity").MpesaTransaction[]>;
}
