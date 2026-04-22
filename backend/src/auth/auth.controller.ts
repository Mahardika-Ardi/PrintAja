import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LogInDto } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpDto } from './dto/token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const data = await this.authService.register(registerDto);
    return {
      message: 'Register successfully',
      data,
    };
  }

  @Public()
  @Post('login')
  async login(@Body() logInDto: LogInDto) {
    const data = await this.authService.login(logInDto);
    return {
      message: 'Login successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-otp')
  async refreshOtp(
    @CurrentUser('id') id: string,
    @Body() refreshOtpDto: OtpDto,
  ) {
    const data = await this.authService.refreshOtp(id, refreshOtpDto);
    return { message: data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('forgot-password')
  async forgotPassword(@CurrentUser('id') id: string) {
    const data = await this.authService.forgotPassword(id);
    return { message: data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-password')
  async resetPassword(
    @CurrentUser('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const data = await this.authService.resetPassword(id, resetPasswordDto);
    return { message: data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-verification-email')
  async sendVerificationEmail(@CurrentUser('id') id: string) {
    const data = await this.authService.sendVerificationEmail(id);
    return { message: data };
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-email')
  async VerifyEmail(
    @CurrentUser('id') id: string,
    @Body() verifyEmailDto: VerifyEmailDto,
  ) {
    const data = await this.authService.VerifyEmail(id, verifyEmailDto);
    return { message: data };
  }
}
