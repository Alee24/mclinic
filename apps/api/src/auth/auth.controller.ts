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
}
