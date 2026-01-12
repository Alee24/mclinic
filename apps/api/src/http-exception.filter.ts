import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : (exception as any).message || 'Internal server error';

        // Log the full error for debugging
        this.logger.error(
            `Error on ${request.url}`,
            (exception as any).stack || exception,
        );

        // In production, we usually hide internal errors, but for this debugging phase
        // we will expose the SQL error message if present.
        const errorDetails =
            status === HttpStatus.INTERNAL_SERVER_ERROR
                ? {
                    statusCode: status,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    message: (exception as any).sqlMessage || (exception as any).message || 'Internal Server Error',
                    error: (exception as any).code || 'Unknown Error',
                }
                : message;

        response.status(status).json(errorDetails);
    }
}
