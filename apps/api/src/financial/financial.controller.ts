import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentProvider } from './entities/payment-config.entity';

@Controller('financial')
export class FinancialController {
    constructor(private financialService: FinancialService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('config')
    setConfig(@Body() body: { provider: PaymentProvider; credentials: any }) {
        return this.financialService.setConfig(body.provider, body.credentials);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('config/:provider')
    getConfig(@Param('provider') provider: PaymentProvider) {
        return this.financialService.getConfig(provider);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('prices')
    setPrice(@Body() body: { serviceName: string; amount: number; doctorId?: number }) {
        return this.financialService.setPrice(body.serviceName, body.amount, body.doctorId);
    }

    @Get('prices')
    getPrices(@Query('doctorId') doctorId?: number) {
        return this.financialService.getPrices(doctorId ? Number(doctorId) : undefined);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('transactions')
    getTransactions() {
        return this.financialService.getAllTransactions();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('invoices')
    createInvoice(@Body() body: any) {
        return this.financialService.createInvoice(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('invoices')
    getInvoices() {
        return this.financialService.getInvoices();
    }
}
