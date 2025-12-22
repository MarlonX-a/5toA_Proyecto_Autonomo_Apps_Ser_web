import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { User } from '../users/user.entity';
import { RefreshToken } from '../tokens/refresh-token.entity';
import { RevokedToken } from '../tokens/revoked-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,

    @InjectRepository(RevokedToken)
    private readonly revokedTokenRepo: Repository<RevokedToken>,
  ) {}

  // REGISTER
  async register(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userRepo.save({
      email,
      passwordHash,
      role: 'user',
    });

    return this.login(user);
  }

  // LOGIN
  async login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      jti: uuidv4(),
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = uuidv4() + uuidv4();
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.refreshTokenRepo.save({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken };
  }

  // VALIDAR LOGIN
  async validateUser(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException();

    return user;
  }

  // LOGOUT
  async logout(payload: any) {
    await this.revokedTokenRepo.save({
      jti: payload.jti,
      userId: payload.sub,
      expiresAt: new Date(payload.exp * 1000),
    });

    await this.refreshTokenRepo.update(
      { userId: payload.sub },
      { revokedAt: new Date() },
    );
  }

  // REFRESH TOKEN
  async refresh(refreshToken: string) {
    const tokens = await this.refreshTokenRepo.find({
      where: { revokedAt: IsNull() },
    });

    for (const token of tokens) {
      const match = await bcrypt.compare(refreshToken, token.tokenHash);
      if (match) {
        if (token.expiresAt < new Date()) {
          throw new UnauthorizedException('Refresh token expirado');
        }

        const payload = {
          sub: token.userId,
          jti: uuidv4(),
        };

        return {
          accessToken: this.jwtService.sign(payload),
        };
      }
    }

    throw new UnauthorizedException('Refresh token inválido');
  }
}
