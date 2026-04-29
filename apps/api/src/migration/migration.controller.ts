import {
  Controller,
  Get,
  Post,
  Param,
  Response,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Get('template/:type')
  async getTemplate(@Param('type') type: string, @Response() res: any) {
    const csv = this.migrationService.getTemplate(type);
    res.set('Content-Type', 'text/csv');
    res.set('Content-Disposition', `attachment; filename=${type}_template.csv`);
    return res.send(csv);
  }

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  async previewData(
    @UploadedFile() file: Express.Multer.File,
    @Body('dataType') dataType: string,
  ) {
    const content = file.buffer.toString('utf-8');
    const isCsv = file.originalname.endsWith('.csv');
    return this.migrationService.previewData(content, dataType, isCsv);
  }

  @Post('execute')
  @UseInterceptors(FileInterceptor('file'))
  async executeMigration(
    @UploadedFile() file: Express.Multer.File,
    @Body('dataType') dataType: string,
  ) {
    const content = file.buffer.toString('utf-8');
    const isCsv = file.originalname.endsWith('.csv');
    return this.migrationService.executeMigration(content, dataType, isCsv);
  }

  @Post('clear')
  async clearDatabase() {
    return this.migrationService.clearDatabase();
  }

  @Get('export/assets')
  async exportAssets(@Response() res: any) {
    try {
      const buffer = await this.migrationService.exportAssets();
      res.set('Content-Type', 'application/zip');
      res.set('Content-Disposition', 'attachment; filename=mclinic_assets.zip');
      return res.send(buffer);
    } catch (error) {
      console.error('[MIGRATION] Export failed:', error);
      return res.status(500).json({ message: 'Failed to export assets' });
    }
  }
}
