export declare enum PaymentProvider {
    MPESA = "mpesa",
    VISA = "visa",
    PAYPAL = "paypal"
}
export declare class PaymentConfig {
    id: number;
    provider: PaymentProvider;
    credentials: string;
    isActive: boolean;
    currency: string;
    createdAt: Date;
    updatedAt: Date;
}
