import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as mongoose from 'mongoose';

/** Shape returned for every error response. */
interface ErrorPayload {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  requestId?: string;
  message: string | string[];
  errors?: Record<string, string>;
}

/**
 * Global HTTP exception filter.
 *
 * Handles:
 *  - NestJS HttpException (native, guards, pipes)
 *  - mongoose.Error.ValidationError  ? 400 with per-field messages
 *  - mongoose.Error.CastError        ? 400 "Invalid ID format"
 *  - MongoServerError code 11000     ? 409 duplicate key
 *  - Everything else                 ? 500
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const res      = ctx.getResponse<Response>();
    const req      = ctx.getRequest<Request & { requestId?: string }>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errors: Record<string, string> | undefined;

    // -- NestJS HttpException -------------------------------------------------
    if (exception instanceof HttpException) {
      status  = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        // ValidationPipe returns { message: string[] }
        message = (b['message'] as string | string[]) ?? exception.message;
      }
    }

    // -- Mongoose ValidationError � field-level errors ------------------------
    else if (exception instanceof mongoose.Error.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      errors = {};
      for (const [field, err] of Object.entries(exception.errors)) {
        errors[field] = (err as mongoose.Error.ValidatorError).message;
      }
    }

    // -- Mongoose CastError � invalid ObjectId, enum, etc. -------------------
    else if (exception instanceof mongoose.Error.CastError) {
      status  = HttpStatus.BAD_REQUEST;
      message = `Invalid value for field '${exception.path}'`;
    }

    // -- MongoDB duplicate-key � MongoServerError code 11000 -----------------
    else if (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as Record<string, unknown>)['code'] === 11000
    ) {
      status = HttpStatus.CONFLICT;
      const keyValue = (exception as Record<string, Record<string, unknown>>)['keyValue'];
      const field = keyValue ? Object.keys(keyValue)[0] : 'field';
      message = `A record with this ${field} already exists`;
    }

    // -- Unknown / programming error ------------------------------------------
    else {
      this.logger.error(
        `[${req.method}] ${req.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const payload: ErrorPayload = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      ...(req.requestId ? { requestId: req.requestId } : {}),
      message,
      ...(errors ? { errors } : {}),
    };

    res.status(status).json(payload);
  }
}
