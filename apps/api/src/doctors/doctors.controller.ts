import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Express } from 'express';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) { }

  @Post()
  create(@Body() createDoctorDto: any) {
    return this.doctorsService.create(createDoctorDto, null);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/me')
  async getProfile(@Request() req: any) {
    return this.doctorsService.findByEmail(req.user.email);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.doctorsService.findAllVerified(search);
  }

  @Get('admin/all')
  findAllAdmin() {
    return this.doctorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/verify')
  verifyDoctor(@Param('id') id: string, @Body('status') status: boolean) {
    return this.doctorsService.verifyDoctor(+id, status);
  }


  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: any) {
    return this.doctorsService.update(+id, updateDoctorDto);
  }

  @Post(':id/upload-profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `doc-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  async uploadProfile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.doctorsService.updateProfileImage(+id, file.filename);
  }

  @Patch(':id/online-status')
  updateOnlineStatus(
    @Param('id') id: string,
    @Body() body: { status: number; latitude?: number; longitude?: number },
  ) {
    return this.doctorsService.updateOnlineStatus(
      +id,
      body.status,
      body.latitude,
      body.longitude,
    );
  }
  @Post(':id/upload-signature')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/signatures',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `sig-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  async uploadSignature(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // In production, you would construct a full URL or relative path handled by static file serving
    // For now, mirroring how profile_image is likely handled (just filename or relative path)
    // Assuming static serve at /uploads/signatures
    const filePath = `${process.env.API_URL || 'http://localhost:3001'}/uploads/signatures/${file.filename}`;
    return this.doctorsService.updateSignature(+id, filePath);
  }

  @Post(':id/upload-stamp')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/stamps',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `stamp-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  async uploadStamp(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = `${process.env.API_URL || 'http://localhost:3001'}/uploads/stamps/${file.filename}`;
    return this.doctorsService.updateStamp(+id, filePath);
  }
}
