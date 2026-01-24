import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) { }

  // @UseGuards(AuthGuard('jwt')) // Temporarily disabled for testing
  @Post()
  create(@Body() createPatientDto: any) {
    return this.patientsService.create(createPatientDto, null);
  }

  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.patientsService.findByUserId(req.user.id);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: any) {
    console.log(`[PATIENTS_CTRL] Update Request for ID: ${id}`);
    console.log(`[PATIENTS_CTRL] Payload:`, updatePatientDto);
    return this.patientsService.update(+id, updatePatientDto);
  }

  @Delete('admin/clear-all')
  clearAll() {
    return this.patientsService.deleteAll();
  }

  @Post('admin/upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  uploadCsv(@UploadedFile() file: Express.Multer.File) {
    return this.patientsService.processCsvUpload(file.buffer);
  }
}
