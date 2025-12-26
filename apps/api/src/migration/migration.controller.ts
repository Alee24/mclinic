import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  async previewData(
    @UploadedFile() file: Express.Multer.File,
    @Body('dataType') dataType: string,
  ) {
    const sqlContent = file.buffer.toString('utf-8');
    return this.migrationService.previewData(sqlContent, dataType);
  }

  @Post('execute')
  @UseInterceptors(FileInterceptor('file'))
  async executeMigration(
    @UploadedFile() file: Express.Multer.File,
    @Body('dataType') dataType: string,
  ) {
    const sqlContent = file.buffer.toString('utf-8');
    return this.migrationService.executeMigration(sqlContent, dataType);
  }

  @Post('clear')
  async clearDatabase() {
    return this.migrationService.clearDatabase();
  }
}
