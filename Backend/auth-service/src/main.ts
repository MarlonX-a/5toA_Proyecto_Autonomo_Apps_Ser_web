import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import * as fs from 'fs';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend (Vite dev server)
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Service-Token',
  });

  // Rate limiting para /auth/login (5 intentos por minuto por IP)
  const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // 5 intentos
    message: { statusCode: 429, message: 'Demasiados intentos de login. Intenta de nuevo en 1 minuto.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/auth/login', loginLimiter);

  // Endpoint JWKS para que otros servicios validen tokens localmente
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/.well-known/jwks.json', (req: any, res: any) => {
    const publicKeyPath = process.env.JWT_PUBLIC_KEY_PATH;
    if (!publicKeyPath) {
      return res.status(500).json({ error: 'JWT_PUBLIC_KEY_PATH not configured' });
    }
    try {
      const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      // Devolver la clave pública en formato PEM para verificación RS256
      res.json({
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            alg: 'RS256',
            kid: 'auth-service-key-1',
            // La clave pública en formato PEM (los clientes pueden parsearla)
            x5c: [publicKey.replace(/-----BEGIN PUBLIC KEY-----/g, '').replace(/-----END PUBLIC KEY-----/g, '').replace(/\n/g, '')],
            pem: publicKey,
          },
        ],
      });
    } catch (e) {
      res.status(500).json({ error: 'Could not read public key' });
    }
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Auth service running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
