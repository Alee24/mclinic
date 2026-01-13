import { Controller, Post, Get, Body, Param, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { FinancialService } from '../financial/financial.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('mpesa')
export class MpesaController {
    constructor(
        private readonly mpesaService: MpesaService,
        @Inject(forwardRef(() => FinancialService))
        private readonly financialService: FinancialService,
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('stk-push')
    async initiateSTKPush(@Body() body: any) {
        const { phoneNumber, amount, accountReference, transactionDesc, relatedEntity, relatedEntityId } = body;

        return await this.mpesaService.initiateSTKPush(
            phoneNumber,
            amount,
            accountReference,
            transactionDesc,
            relatedEntity,
            relatedEntityId,
        );
    }

    @Post('callback')
    async handleCallback(@Body() callbackData: any) {
        console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

        try {
            const transaction = await this.mpesaService.handleCallback(callbackData);

            // Link to Financial System (Update Invoice to PAID)
            if (transaction && transaction.status === 'SUCCESS' && transaction.relatedEntity === 'invoice' && transaction.relatedEntityId) {
                try {
                    console.log(`[MPESA-CONTROLLER] Confirming Invoice ID: ${transaction.relatedEntityId}`);
                    await this.financialService.confirmInvoicePayment(
                        transaction.relatedEntityId,
                        'MPESA',
                        transaction.mpesaReceiptNumber
                    );
                } catch (e) {
                    console.warn(`[MPESA-CONTROLLER] Invoice update warning: ${e.message}`);
                }
            }

            console.log('Transaction updated:', transaction);
            return { ResultCode: 0, ResultDesc: 'Success' };
        } catch (error) {
            console.error('Callback processing error:', error);
            return { ResultCode: 1, ResultDesc: 'Failed' };
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('status/:checkoutRequestId')
    async queryStatus(@Param('checkoutRequestId') checkoutRequestId: string) {
        return await this.mpesaService.stkPushQuery(checkoutRequestId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('transaction/:checkoutRequestId')
    async getTransaction(@Param('checkoutRequestId') checkoutRequestId: string) {
        return await this.mpesaService.getTransactionByCheckoutRequestId(checkoutRequestId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('transactions')
    async getAllTransactions() {
        return await this.mpesaService.getAllTransactions();
    }
}
