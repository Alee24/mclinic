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
  Delete,
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
  findAll(
    @Query('search') search?: string,
    @Query('include_offline') includeOffline?: string
  ) {
    const isOfflineIncluded = includeOffline === 'true';
    return this.doctorsService.findAllVerified(search, isOfflineIncluded);
  }

  @Get('nearby')
  findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string, // km
    @Query('include_all') includeAll?: string,
  ) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = radius ? parseFloat(radius) : 50;
    const shouldIncludeAll = includeAll === 'true';

    // Provide defaults if missing to avoid NaN errors, though validation should handle it
    if (isNaN(latNum) || isNaN(lngNum)) {
      return [];
    }

    return this.doctorsService.getNearby(latNum, lngNum, radiusNum, shouldIncludeAll);
  }

  @Get('admin/all')
  findAllAdmin() {
    return this.doctorsService.findAll();
  }

  @Post('admin/sync')
  @UseGuards(AuthGuard('jwt')) // Admin guard ideally
  syncDoctors() {
    return this.doctorsService.syncDoctorsWithUsers();
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
    const filePath = `${process.env.API_URL || 'https://portal.mclinic.co.ke/api'}/uploads/signatures/${file.filename}`;
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
    const filePath = `${process.env.API_URL || 'https://portal.mclinic.co.ke/api'}/uploads/stamps/${file.filename}`;
    return this.doctorsService.updateStamp(+id, filePath);
  }

  // ==================== APPROVAL ENDPOINTS ====================

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/pending')
  findPending() {
    return this.doctorsService.findPendingDoctors();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/approve')
  async approveDoctor(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.doctorsService.approveDoctor(+id, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/reject')
  async rejectDoctor(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    return this.doctorsService.rejectDoctor(+id, req.user.id, reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/renew-license')
  async renewLicense(
    @Param('id') id: string,
    @Body('expiryDate') expiryDate: string,
  ) {
    return this.doctorsService.renewLicense(+id, new Date(expiryDate));
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/suspend')
  suspend(@Param('id') id: string, @Body('reason') reason: string) {
    return this.doctorsService.suspend(+id, reason);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.doctorsService.updateStatus(+id, 1);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.doctorsService.updateStatus(+id, 0);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/id-card')
  async generateIdCard(@Param('id') id: string) {
    try {
      return await this.doctorsService.generateIdCard(+id);
    } catch (error) {
      console.error('Error generating ID card:', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('admin/approve-all')
  async approveAllDoctors(@Request() req: any) {
    return this.doctorsService.approveAll(req.user.id);
  }
}
