import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

/**
 * Logs controller name, handler method, and execution duration for every
 * routed request. Operates at the handler level (after guards/pipes).
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Route');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const label = `${controllerName}#${handlerName}`;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.verbose(`${label} — ${Date.now() - start}ms`);
        },
        error: () => {
          this.logger.warn(`${label} — ${Date.now() - start}ms [error]`);
        },
      }),
    );
  }
}
