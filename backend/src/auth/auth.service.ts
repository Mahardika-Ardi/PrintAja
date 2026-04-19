import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LogInDto } from './dto/login.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { HashService } from 'src/common/hash/hash.service';
import { AppError } from 'src/common/utils/app-error.utils';
import { loginSelect, registerSelect } from './auth-select';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hash: HashService,
    private readonly jwt: JwtService,
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
      role: check.phone,
    };
    const token = await this.jwt.signAsync(payload);

    return {
      access_token: token,
      user: payload,
    };
  }
}
