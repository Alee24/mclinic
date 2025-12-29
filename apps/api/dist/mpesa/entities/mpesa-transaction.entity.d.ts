export declare class MpesaTransaction {
    id: number;
    merchantRequestId: string;
    checkoutRequestId: string;
    phoneNumber: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
    status: string;
    resultCode: string;
    resultDesc: string;
    mpesaReceiptNumber: string;
    transactionDate: Date;
    relatedEntity: string;
    relatedEntityId: number;
    createdAt: Date;
    updatedAt: Date;
}
