import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LogInDto } from './dto/login.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HashService } from 'src/common/hash/hash.service';
import { AppError } from 'src/common/utils/app-error.utils';
import { loginSelect, registerSelect } from './auth-select';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpType } from 'generated/prisma/enums';
import { OtpService } from 'src/common/otp/otp.service';
import { MailService } from 'src/common/mail/mail.service';
import { OtpDto } from './dto/token.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly jwt: JwtService,
    private readonly otp: OtpService,
    private readonly mail: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
      select: { email: true },
    });

    if (existing?.email == registerDto.email) {
      throw AppError.conflict('Email', {
        message: 'E - Mail is already used, try another!',
      });
    }

    const hashedPassword = await this.hash.hash(registerDto.password);

    return await this.prisma.user.create({
      data: { ...registerDto, password: hashedPassword },
      select: registerSelect,
    });
  }
  async login(loginDto: LogInDto) {
    const check = await this.prisma.user.findFirst({
      where: { OR: [{ email: loginDto.email }, { phone: loginDto.phone }] },
      select: loginSelect,
    });

    if (!check) {
      throw AppError.unauthorized('Invalid', {
        message: 'Invalid credentials',
      });
    }

    const verifyPassword = await this.hash.verify(
      check.password,
      loginDto.password,
    );

    if (!verifyPassword) {
      throw AppError.unauthorized('Invalid', {
        message: 'Invalid credentials',
      });
    }

    const payload = {
      id: check.id,
      email: check.email,
      phone: check.phone,
      role: check.role,
    };
    const token = await this.jwt.signAsync(payload);

    return {
      access_token: token,
      user: payload,
    };
  }

  async forgotPassword(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: { email: true },
    });

    if (!user) {
      throw AppError.notFound('User', {
        message: 'No account found with this id',
      });
    }

    const code = await this.otp.generate(id, OtpType.RESET_PASSWORD);
    await this.mail.sendOtp(user.email, 'Reset Password', code);

    return 'OTP code has been sent to your email';
  }

  async refreshOtp(id: string, refreshOtpDto: OtpDto) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: { email: true },
    });

    if (!user) {
      throw AppError.notFound('User', {
        message: 'No account found with this id',
      });
    }

    const code = await this.otp.generate(id, refreshOtpDto.type);
    const title = refreshOtpDto.type
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    await this.mail.sendOtp(user.email, title, code);

    return 'OTP code has been sent to your email';
  }

  async resetPassword(id: string, resetPasswordDto: ResetPasswordDto) {
    await this.otp.verify(resetPasswordDto.code, OtpType.RESET_PASSWORD, id);

    const hashed = await this.hash.hash(resetPasswordDto.password);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    return 'Password has been reset successfully';
  }

  async sendVerificationEmail(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: { email: true, isVerified: true },
    });

    if (!user) {
      throw AppError.notFound('User', {
        message: 'No account found with this id',
      });
    }
    if (user.isVerified) {
      throw AppError.badRequest({
        message: 'Email is already verified',
      });
    }

    const code = await this.otp.generate(id, OtpType.EMAIL_VERIFICATION);
    const title = OtpType.EMAIL_VERIFICATION.toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    await this.mail.sendOtp(user.email, title, code);

    return 'OTP code has been sent to your email';
  }

  async VerifyEmail(id: string, verifyEmailDto: VerifyEmailDto) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: { isVerified: true },
    });

    if (!user) {
      throw AppError.notFound('User', {
        message: 'No account found with this id',
      });
    }
    if (user.isVerified) {
      throw AppError.badRequest({
        message: 'Email is already verified',
      });
    }

    await this.otp.verify(verifyEmailDto.code, OtpType.EMAIL_VERIFICATION, id);
    await this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
    });

    return 'Seccessfully verified email';
  }
}
