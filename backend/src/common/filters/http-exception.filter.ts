import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'generated/prisma/client';
import { prismaErrors } from '../utils/prisma-error.utils';
import { AppError } from '../utils/app-error.utils';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      this.logger.warn(`[${status} ${request.method} ${request.url}]`);

      response.status(status).json(body);
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(
        `Prisma [${exception.code}] ${request.method} ${request.url}`,
      );

      try {
        await prismaErrors(exception);
      } catch (httpError: unknown) {
        if (httpError instanceof HttpException) {
          response
            .status(httpError.getStatus())
            .json(httpError.getResponse() as Record<string, unknown>);
          return;
        }
      }

      this.logger.error(
        `Unexpected error: ${request.method} ${request.url}`,
        exception,
      );

      const fallback = AppError.internal();
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(fallback.getResponse() as Record<string, unknown>);
    }
  }
}
