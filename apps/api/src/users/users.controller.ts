import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as express from 'express';
import { DataSource } from 'typeorm';
import * as fs from 'fs';

import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('profile/:id')
  async getPublicProfile(@Param('id') id: string) {
    return this.usersService.findPublicProfile(+id);
  }

  @Get('count-active')
  async countActive() {
    const count = await this.usersService.countActive();
    return { count };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('admin/reset-all-passwords')
  async resetAllPasswords(@Body('password') password: string, @Request() req: any) {
    // Default to Mclinic@2026 if not provided
    const pass = password || 'Mclinic@2026';
    return this.usersService.resetAllPasswords(pass, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/reset')
  resetPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.resetPassword(+id, password);
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/public')
  async togglePublic(@Param('id') id: string, @Body('isPublic') isPublic: boolean) {
    return this.usersService.togglePublic(+id, isPublic);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // Consistent uploads base path (matches main.ts)
  private getUploadsPath(...segments: string[]) {
    return join(process.cwd(), 'apps', 'api', 'uploads', ...segments);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/upload-profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = join(process.cwd(), 'apps', 'api', 'uploads', 'profiles');
          // Ensure directory exists
          if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop();
          cb(null, `profile-${uniqueSuffix}.${ext}`);
        },
      }),
    }),
  )
  async uploadProfile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateProfilePicture(+id, file.filename);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/deletion-request')
  async requestDeletion(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.requestDeletion(+id, password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/deletion-request')
  async cancelDeletion(@Param('id') id: string) {
    return this.usersService.cancelDeletion(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id/deletion-status')
  async getDeletionStatus(@Param('id') id: string) {
    return this.usersService.getDeletionStatus(+id);
  }

  @Get('profile-image/:id')
  async getProfileImage(@Param('id') id: string, @Res() res: express.Response) {
    let user = await this.usersService.findById(+id);
    let doctorProfileImage: string | null = null;
    
    // Fallback: If not found by User ID, check if it's a Doctor ID
    if (!user) {
      const doctor = await this.dataSource.query(
        'SELECT email, profile_image FROM doctors WHERE id = ?',
        [+id]
      );
      if (doctor && doctor.length > 0) {
        user = await this.usersService.findOne(doctor[0].email);
        doctorProfileImage = doctor[0].profile_image;
      }
    }

    // If no user profile picture, check the doctor's profile_image field
    const profileFilename = user?.profilePicture || doctorProfileImage;

    if (!profileFilename) {
      return this.serveDefaultAvatar(user?.fname || String(user?.role || 'User'), res);
    }

    // Try the consistent path first (process.cwd based - matches main.ts)
    const primaryPath = this.getUploadsPath('profiles', profileFilename);
    if (fs.existsSync(primaryPath)) {
      return res.sendFile(primaryPath);
    }

    // Legacy fallback: try __dirname based path (for any files saved before this fix)
    const legacyPath = join(__dirname, '..', '..', 'uploads', 'profiles', profileFilename);
    if (fs.existsSync(legacyPath)) {
      return res.sendFile(legacyPath);
    }

    // If it's a full URL (http), redirect to it
    if (profileFilename.startsWith('http')) {
      return res.redirect(profileFilename);
    }

    return this.serveDefaultAvatar(user?.fname || String(user?.role || 'User'), res);
  }

  private serveDefaultAvatar(name: string, res: express.Response) {
    const color = '6366f1';
    const displayName = encodeURIComponent(name || 'User');
    return res.redirect(`https://ui-avatars.com/api/?name=${displayName}&background=${color}&color=fff&size=128&bold=true`);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('admin/export-csv')
  async exportCsv(@Res() res: express.Response) {
    const csv = await this.usersService.exportUsersToCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    return res.send(csv);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('admin/import-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File) {
    return this.usersService.importUsersFromCsv(file.buffer);
  }
}
