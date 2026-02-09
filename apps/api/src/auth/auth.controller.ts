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

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req: any) {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req: any, @Res() res: any) {
    const user = await this.authService.validateGoogleUser(req.user);
    const { access_token } = await this.authService.loginWithGoogle(user);
    // Redirect to dashboard with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5054';
    res.redirect(`${frontendUrl}/dashboard?token=${access_token}`);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  // --- OTP Endpoints ---
  @Post('otp/send')
  async sendOtp(@Body() body: { mobile: string }) {
    return this.authService.sendLoginOtp(body.mobile);
  }

  @Post('otp/login')
  async loginOtp(@Body() body: { mobile: string; otp: string }) {
    return this.authService.loginWithOtp(body.mobile, body.otp);
  }

  @Post('otp/reset-password-request')
  async requestResetOtp(@Body() body: { mobile: string }) {
    return this.authService.sendPasswordResetOtp(body.mobile);
  }

  @Post('otp/reset-password')
  async resetPasswordWithOtp(@Body() body: { mobile: string; otp: string; newPass: string }) {
    return this.authService.resetPasswordWithOtp(body.mobile, body.otp, body.newPass);
  }
}
