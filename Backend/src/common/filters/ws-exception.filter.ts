import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

/**
 * WebSocket exception filter.
 * Catches WsException thrown inside Socket.io gateways and emits
 * a structured error event back to the originating client.
 */
@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost): void {
    const client = host.switchToWs().getClient<{ emit: (event: string, data: unknown) => void }>();
    const message = exception.message ?? 'WebSocket error';

    this.logger.warn(`WsException: ${message}`);

    client.emit('error', {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
