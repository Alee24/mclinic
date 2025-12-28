import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Patch,
  Delete,
  Req,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentProvider } from './entities/payment-config.entity';

@Controller('financial')
export class FinancialController {
  constructor(private financialService: FinancialService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('withdraw')
  async withdraw(@Body() body: { amount: number; method: string; details: string }, @Req() req: any) {
    return this.financialService.withdrawFunds(req.user, body.amount, body.method, body.details);
  }

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
  setPrice(
    @Body() body: { serviceName: string; amount: number; doctorId?: number },
  ) {
    return this.financialService.setPrice(
      body.serviceName,
      body.amount,
      body.doctorId,
    );
  }

  @Get('prices')
  getPrices(@Query('doctorId') doctorId?: number) {
    return this.financialService.getPrices(
      doctorId ? Number(doctorId) : undefined,
    );
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
  getInvoices(@Req() req: any) {
    return this.financialService.getInvoices(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('invoices/:id')
  getInvoiceById(@Param('id') id: string) {
    return this.financialService.getInvoiceById(Number(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('invoices/:id')
  updateInvoice(@Param('id') id: string, @Body() body: any) {
    return this.financialService.updateInvoice(Number(id), body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('invoices/:id')
  deleteInvoice(@Param('id') id: string) {
    return this.financialService.deleteInvoice(Number(id));
  }

  @Get('stats')
  @UseGuards(AuthGuard('jwt'))
  async getStats(@Req() req: any) {
    console.log(`[FINANCIAL] getStats (AUTH) called for User ID: ${req.user.id}, Role: ${req.user.role}, Email: ${req.user.email}`);
    try {
      const stats = await this.financialService.getStats(req.user);
      return stats;
    } catch (e) {
      console.error(`[FINANCIAL] error for ${req.user.email}:`, e.message);
      throw e;
    }
  }

  // M-Pesa STK Push
  @Post('mpesa/stk-push')
  async initiateMpesaPayment(
    @Body() body: { phoneNumber: string; amount: number; invoiceId: number },
  ) {
    return this.financialService.initiateMpesaPayment(
      body.phoneNumber,
      body.amount,
      body.invoiceId,
    );
  }

  // M-Pesa Callback (webhook)
  @Post('mpesa/callback')
  async mpesaCallback(@Body() body: any) {
    return this.financialService.handleMpesaCallback(body);
  }

  // Manual payment confirmation
  @Post('invoices/:id/confirm-payment')
  async confirmPayment(
    @Param('id') id: string,
    @Body() body: { paymentMethod: string; transactionId?: string },
  ) {
    return this.financialService.confirmInvoicePayment(
      Number(id),
      body.paymentMethod,
      body.transactionId,
    );
  }

  @Post('process-payment')
  async processPayment(
    @Body()
    body: {
      appointmentId: number;
      amount: number;
      phoneNumber: string;
    },
  ) {
    return this.financialService.processPayment(
      body.appointmentId,
      body.amount,
      body.phoneNumber,
    );
  }
  @Get('stats/debug')
  async getStatsDebug(@Query('email') email: string) {
    console.log(`[DEBUG] calling getDoctorStats for ${email}`);
    try {
      const stats = await this.financialService.getDoctorStats({ email, id: 0 } as any); // ID 0 mock for debug
      return { status: 'OK', stats };
    } catch (e) {
      const allDoctors = await this.financialService.debugListDoctors();
      return { status: 'ERROR', message: e.message, email, availableDoctors: allDoctors };
    }
  }

  @Post('reconcile')
  async reconcileBalance(@Body() body: { doctorId: number }) {
    return this.financialService.recalculateDoctorBalance(body.doctorId);
  }

  @Post('migrate-wallets')
  async migrateWallets() {
    return this.financialService.migrateBalancesToWallets();
  }
}
