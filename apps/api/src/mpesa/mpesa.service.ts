import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { MpesaTransaction } from './entities/mpesa-transaction.entity';

@Injectable()
export class MpesaService {
    private readonly consumerKey: string;
    private readonly consumerSecret: string;
    private readonly passkey: string;
    private readonly shortcode: string;
    private readonly callbackUrl: string;
    private readonly environment: string;

    constructor(
        @InjectRepository(MpesaTransaction)
        private mpesaTransactionRepository: Repository<MpesaTransaction>,
        private configService: ConfigService,
    ) {
        this.consumerKey = this.configService.get('MPESA_CONSUMER_KEY') || '';
        this.consumerSecret = this.configService.get('MPESA_CONSUMER_SECRET') || '';
        this.passkey = this.configService.get('MPESA_PASSKEY') || '';
        this.shortcode = this.configService.get('MPESA_SHORTCODE') || '';
        this.callbackUrl = this.configService.get('MPESA_CALLBACK_URL') || '';
        this.environment = this.configService.get('MPESA_ENV') || 'sandbox';
    }

    private get baseUrl(): string {
        return this.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    async getAccessToken(): Promise<string> {
        try {
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

            const response = await axios.get(
                `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                    },
                },
            );

            return response.data.access_token;
        } catch (error) {
            console.error('M-Pesa Access Token Error:', error.response?.data || error.message);
            throw new HttpException(
                'Failed to get M-Pesa access token',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async initiateSTKPush(
        phoneNumber: string,
        amount: number,
        accountReference: string,
        transactionDesc: string,
        relatedEntity?: string,
        relatedEntityId?: number,
    ): Promise<MpesaTransaction> {
        try {
            const accessToken = await this.getAccessToken();
            const timestamp = new Date()
                .toISOString()
                .replace(/[^0-9]/g, '')
                .slice(0, 14);
            const password = Buffer.from(
                `${this.shortcode}${this.passkey}${timestamp}`,
            ).toString('base64');

            // Format phone number (remove leading 0 or +254, add 254)
            let formattedPhone = phoneNumber.replace(/\s/g, '');
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '254' + formattedPhone.substring(1);
            } else if (formattedPhone.startsWith('+254')) {
                formattedPhone = formattedPhone.substring(1);
            } else if (!formattedPhone.startsWith('254')) {
                formattedPhone = '254' + formattedPhone;
            }

            const payload = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.round(amount),
                PartyA: formattedPhone,
                PartyB: this.shortcode,
                PhoneNumber: formattedPhone,
                CallBackURL: this.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc,
            };

            console.log('Initiating STK Push:', { phoneNumber: formattedPhone, amount, accountReference });

            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            // Save transaction to database
            const transaction = this.mpesaTransactionRepository.create({
                merchantRequestId: response.data.MerchantRequestID,
                checkoutRequestId: response.data.CheckoutRequestID,
                phoneNumber: formattedPhone,
                amount: amount,
                accountReference: accountReference,
                transactionDesc: transactionDesc,
                status: 'PENDING',
                relatedEntity: relatedEntity,
                relatedEntityId: relatedEntityId,
            });

            return await this.mpesaTransactionRepository.save(transaction);
        } catch (error) {
            console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
            throw new HttpException(
                error.response?.data?.errorMessage || 'Failed to initiate M-Pesa payment',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async stkPushQuery(checkoutRequestId: string): Promise<any> {
        try {
            const accessToken = await this.getAccessToken();
            const timestamp = new Date()
                .toISOString()
                .replace(/[^0-9]/g, '')
                .slice(0, 14);
            const password = Buffer.from(
                `${this.shortcode}${this.passkey}${timestamp}`,
            ).toString('base64');

            const payload = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId,
            };

            const response = await axios.post(
                `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            return response.data;
        } catch (error) {
            console.error('M-Pesa Query Error:', error.response?.data || error.message);
            throw new HttpException(
                'Failed to query M-Pesa transaction status',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async handleCallback(callbackData: any): Promise<MpesaTransaction> {
        try {
            const { Body } = callbackData;
            const { stkCallback } = Body;

            const checkoutRequestId = stkCallback.CheckoutRequestID;
            const merchantRequestId = stkCallback.MerchantRequestID;
            const resultCode = stkCallback.ResultCode;
            const resultDesc = stkCallback.ResultDesc;

            // Find transaction
            const transaction = await this.mpesaTransactionRepository.findOne({
                where: { checkoutRequestId },
            });

            if (!transaction) {
                console.error('Transaction not found:', checkoutRequestId);
                throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
            }

            // Update transaction status
            if (resultCode === 0) {
                // Success
                const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
                const mpesaReceiptNumber = callbackMetadata.find(
                    (item: any) => item.Name === 'MpesaReceiptNumber',
                )?.Value;
                const transactionDate = callbackMetadata.find(
                    (item: any) => item.Name === 'TransactionDate',
                )?.Value;

                transaction.status = 'SUCCESS';
                transaction.resultCode = resultCode.toString();
                transaction.resultDesc = resultDesc;
                transaction.mpesaReceiptNumber = mpesaReceiptNumber;
                transaction.transactionDate = transactionDate
                    ? this.parseMpesaDate(transactionDate.toString())
                    : new Date();
            } else {
                // Failed
                transaction.status = 'FAILED';
                transaction.resultCode = resultCode.toString();
                transaction.resultDesc = resultDesc;
            }

            return await this.mpesaTransactionRepository.save(transaction);
        } catch (error) {
            console.error('M-Pesa Callback Error:', error);
            throw error;
        }
    }

    private parseMpesaDate(dateString: string): Date {
        // M-Pesa date format: YYYYMMDDHHmmss
        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(4, 6)) - 1;
        const day = parseInt(dateString.substring(6, 8));
        const hour = parseInt(dateString.substring(8, 10));
        const minute = parseInt(dateString.substring(10, 12));
        const second = parseInt(dateString.substring(12, 14));

        return new Date(year, month, day, hour, minute, second);
    }

    async getTransactionByCheckoutRequestId(
        checkoutRequestId: string,
    ): Promise<MpesaTransaction | null> {
        return await this.mpesaTransactionRepository.findOne({
            where: { checkoutRequestId },
        });
    }

    async getAllTransactions(): Promise<MpesaTransaction[]> {
        return await this.mpesaTransactionRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
}
