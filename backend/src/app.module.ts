import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HashModule } from './common/hash/hash.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './common/mail/mail.module';
import { OtpService } from './common/otp/otp.service';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    HashModule,
    HealthModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, OtpService],
})
export class AppModule {}
