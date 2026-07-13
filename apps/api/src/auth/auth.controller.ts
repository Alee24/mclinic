import { Controller, Post, Body, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id, req.user.role);
  }

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('register/doctor')
  registerDoctor(@Body() body: any) {
    return this.authService.registerDoctor(body);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }
  
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('impersonate')
  async impersonate(@Body('userId') userId: number, @Request() req: any) {
    return this.authService.impersonate(req.user.id, userId);
  }

  @Post('otp/send')
  async sendOtp(@Body() body: { mobile: string; userType?: 'patient' | 'provider' }) {
    return this.authService.sendOtp(body.mobile, body.userType);
  }

  @Post('otp/login')
  async loginWithOtp(@Body() body: { mobile: string; otp: string; userType?: 'patient' | 'provider' }) {
    return this.authService.loginWithOtp(body.mobile, body.otp, body.userType);
  }

  @Post('mpesa-miniapp/login')
  async mpesaMiniappLogin(@Body() body: { authCode: string; phoneNumber?: string }) {
    return this.authService.mpesaMiniappLogin(body.authCode, body.phoneNumber);
  }
}
