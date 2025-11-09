import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import cors from 'cors';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Configurar CORS
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  }));

  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Configurar Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));
  
  await app.listen(4000);
  console.log('🚀 Servidor WebSocket corriendo en puerto 4000');
  console.log('📡 Dashboard disponible en http://localhost:4000/dashboard.html');
  console.log('🔌 WebSocket disponible en ws://localhost:4000');
}

bootstrap();
