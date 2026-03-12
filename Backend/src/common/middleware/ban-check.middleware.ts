import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { User, UserDocument } from '../../modules/users/schemas/user.schema';

/**
 * Checks whether an authenticated user is banned before processing the request.
 * Only runs if a valid Bearer token is present — anonymous requests pass through.
 */
@Injectable()
export class BanCheckMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BanCheckMiddleware.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) return next();

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });
      const user = await this.userModel
        .findById(new Types.ObjectId(payload.sub))
        .select('isBanned banReason isActive')
        .lean();

      if (!user || !user.isActive) {
        throw new ForbiddenException('Account is deactivated');
      }
      if (user.isBanned) {
        this.logger.warn(`Banned user attempted access: ${payload.sub}`);
        throw new ForbiddenException(
          `Account banned: ${(user as any).banReason || 'Policy violation'}`,
        );
      }
    } catch (err) {
      if (err instanceof ForbiddenException) throw err;
      // Token invalid/expired — JWT guard will handle the 401 downstream
    }

    next();
  }
}
