import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

import { User } from '../users/user.entity';
import { RefreshToken } from '../tokens/refresh-token.entity';
import { RevokedToken } from '../tokens/revoked-token.entity';

function getEnv(name: string, fallback?: string) {
  return process.env[name] ?? fallback;
}

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
  async register(
    username: string,
    password: string,
    email?: string,
    firstName?: string,
    lastName?: string,
    role = 'user',
    telefono?: string,
    descripcion?: string,
    ubicacion?: any,
  ) {
    // check duplicates first to return a friendly error
    const existing = await this.userRepo.findOne({ where: [{ username }, { email }] });
    if (existing) {
      if (existing.username === username) throw new ConflictException('Username already exists');
      if (email && existing.email === email) throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userRepo.save({
      username,
      email,
      firstName,
      lastName,
      passwordHash,
      role,
    });

    // Sincronizar con Django: crear cliente o proveedor
    await this.syncWithDjango(user, role, telefono, descripcion, ubicacion);

    return this.login(user);
  }

  // Sincronizar usuario con Django (crear cliente/proveedor)
  private async syncWithDjango(
    user: User,
    role: string,
    telefono?: string,
    descripcion?: string,
    ubicacion?: any,
  ) {
    const base = getEnv('DJANGO_API_BASE');
    const serviceToken = getEnv('DJANGO_SERVICE_TOKEN');
    
    if (!base || !serviceToken) {
      console.warn('Django integration not configured, skipping sync');
      return;
    }

    try {
      if (role === 'cliente') {
        const url = `${base.replace(/\/$/, '')}/api_rest/api/v1/cliente/`;
        const payload = {
          user_id: user.id,
          telefono: telefono || '0000000000',
          ubicacion: ubicacion || null,
        };
        await axios.post(url, payload, { headers: { Authorization: `Token ${serviceToken}` } });
      } else if (role === 'proveedor') {
        const url = `${base.replace(/\/$/, '')}/api_rest/api/v1/proveedor/`;
        const payload = {
          user_id: user.id,
          telefono: telefono || '0000000000',
          descripcion: descripcion || 'Sin descripción',
          ubicacion: ubicacion || null,
        };
        await axios.post(url, payload, { headers: { Authorization: `Token ${serviceToken}` } });
      }
    } catch (e: any) {
      console.error('Failed to sync with Django:', e.response?.data ?? e.message);
      // No lanzar error para no bloquear el registro
    }
  }

  // LOGIN
  async login(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
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

  // VALIDAR LOGIN (por username)
  async validateUser(username: string, password: string) {
    const user = await this.userRepo.findOne({ where: { username } });
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
