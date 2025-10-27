import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

export function configureStaticAssets(app: NestExpressApplication) {
  // Servir archivos estáticos desde la carpeta public
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/static/',
  });

  // Servir el dashboard directamente en la raíz
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
    index: ['dashboard.html'],
  });
}
