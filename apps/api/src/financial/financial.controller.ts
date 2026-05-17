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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FinancialService } from './financial.service';
import { AuthGuard } from '@nestjs/passport';
import { PaymentProvider } from './entities/payment-config.entity';
import { EmailService } from '../email/email.service';

@Controller('financial')
export class FinancialController {
  constructor(
    private financialService: FinancialService,
    private emailService: EmailService,
  ) { }

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
  @Get('revenue')
  getRevenue() {
    return this.financialService.getRevenueReport();
  }

  @Get('receipt/:transactionId')
  getReceipt(@Param('transactionId') transactionId: string) {
    return this.financialService.generateReceipt(Number(transactionId));
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

  @UseGuards(AuthGuard('jwt'))
  @Get('stats')
  async getStats(@Req() req: any) {
    const user = req.user || null;
    console.log(`[FINANCIAL] getStats called for User: ${user ? `${user.email} (ID: ${user.id}, Role: ${user.role})` : 'Public/Unauthenticated'}`);
    try {
      const stats = await this.financialService.getStats(user);
      return stats;
    } catch (e) {
      console.error(`[FINANCIAL] error:`, e.message);
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

  @UseGuards(AuthGuard('jwt'))
  @Post('invoices/:id/send-email')
  async sendInvoiceEmail(@Param('id') id: string) {
    const invoice = await this.financialService.getInvoiceById(Number(id));
    if (!invoice) {
      throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND);
    }

    const customerEmail = invoice.customerEmail;
    if (!customerEmail || customerEmail === 'null null' || customerEmail === 'N/A') {
      throw new HttpException('Customer email not available for this invoice', HttpStatus.BAD_REQUEST);
    }

    const statusColor = invoice.status === 'paid' ? '#059669' : '#f59e0b';
    const statusLabel = invoice.status.toUpperCase();

    const html = `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; color: #1f2937; line-height: 1.6;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #059669; font-size: 24px; font-weight: 800; margin: 0;">M-CLINIC KENYA</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 5px 0 0 0;">Medical & Ambulance Services</p>
        </div>

        <div style="background-color: #f9fafb; border-radius: 16px; padding: 30px; border: 1px solid #e5e7eb;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 5px 0;">INVOICE</h2>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Invoice #: <strong>${invoice.invoiceNumber}</strong></p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Date: ${new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Due: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <span style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">${statusLabel}</span>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 5px 0;">Bill To</p>
            <p style="margin: 0; font-weight: 600;">${invoice.customerName}</p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${customerEmail}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="text-align: left; padding: 10px 0; font-size: 12px; text-transform: uppercase; color: #6b7280;">Description</th>
                <th style="text-align: right; padding: 10px 0; font-size: 12px; text-transform: uppercase; color: #6b7280;">Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 0;">Medical & Clinical Services</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600;">${Number(invoice.totalAmount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: right; background-color: #111827; color: white; padding: 15px 20px; border-radius: 12px;">
            <span style="font-size: 14px;">Total Due: </span>
            <span style="font-size: 22px; font-weight: 800;">KES ${Number(invoice.totalAmount).toLocaleString()}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://portal.mclinic.co.ke/dashboard/invoices" style="background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; display: inline-block;">View Invoice Online</a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Thank you for choosing M-Clinic Kenya!</p>
          <p>&copy; ${new Date().getFullYear()} M-Clinic Health Kenya. All rights reserved.</p>
        </div>
      </div>
    `;

    try {
      await (this.emailService as any).sendMailWithContext({
        to: customerEmail,
        subject: `Invoice ${invoice.invoiceNumber} - M-Clinic Kenya`,
        html,
      });
      return { success: true, message: `Invoice sent to ${customerEmail}` };
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      throw new HttpException(`Failed to send email: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
