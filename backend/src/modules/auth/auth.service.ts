import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { hashPassword, comparePassword } from './auth.utils';
import { jwtConstants } from '../../app.constants';

import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already registered');
    const passwordHash = await hashPassword(dto.password);
    const user = await this.usersService.createUser({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: 'customer',
      emailVerified: false,
    });
    return { message: 'Registration successful', userId: user._id };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, jwtConstants.secret, { expiresIn: jwtConstants.expiresIn });
    return { access_token: token, user: { id: user._id, email: user.email, name: user.name, role: user.role } };
  }
}
