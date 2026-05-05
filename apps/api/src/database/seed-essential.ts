import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedingService } from '../seeding/seeding.service';

async function bootstrap() {
  console.log('[Seed] Initializing NestJS context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedingService = app.get(SeedingService);
  
  try {
    console.log('[Seed] Running Essential Seed (Admin & Settings)...');
    const result = await seedingService.seedEssential();
    console.log('[Seed] Success:', result.message);
  } catch (error) {
    console.error('[Seed] Critical Error:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
