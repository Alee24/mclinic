import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AllExceptionsFilter } from './http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Ensure uploads directory exists
  const fs = require('fs');
  const uploadsDir = join(__dirname, '..', 'uploads');
  const profilesDir = join(uploadsDir, 'profiles');
  const sigsDir = join(uploadsDir, 'signatures');
  const stampsDir = join(uploadsDir, 'stamps');
  
  [uploadsDir, profilesDir, sigsDir, stampsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
  console.log(`[API] Static Assets mounted at: ${uploadsDir}`);

  // Serve static files from 'uploads' directory
  app.useStaticAssets(uploadsDir, {
    prefix: '/api/uploads/',
  });

  const port = process.env.PORT ?? 7899;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
