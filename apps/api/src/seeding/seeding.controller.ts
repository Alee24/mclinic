import { Controller, Post } from '@nestjs/common';
import { SeedingService } from './seeding.service';

@Controller('seeding')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) { }

  @Post('run')
  async runSeeding() {
    return this.seedingService.seedAll();
  }

  @Post('clear')
  async clearData() {
    return this.seedingService.clearAll();
  }

  @Post('settings')
  async seedSettings() {
    await this.seedingService.seedSettings();
    return { message: 'M-Pesa settings seeded if they did not exist.' };
  }
}
