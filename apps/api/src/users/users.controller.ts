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

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/upload-profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(__dirname, '..', '..', 'uploads', 'profiles'),
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
    
    // Fallback: If not found by User ID, check if it's a Doctor ID
    if (!user) {
      const doctor = await this.dataSource.query(
        'SELECT email FROM doctors WHERE id = ?',
        [+id]
      );
      if (doctor && doctor.length > 0) {
        user = await this.usersService.findOne(doctor[0].email);
      }
    }

    if (!user || !user.profilePicture) {
      return this.serveDefaultAvatar(String(user?.role || 'User'), res);
    }

    const filePath = join(__dirname, '..', '..', 'uploads', 'profiles', user.profilePicture);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    return this.serveDefaultAvatar(String(user?.role || 'User'), res);
  }

  private serveDefaultAvatar(role: string, res: express.Response) {
    // Return a color-coded default avatar or just a 404 for the browser to handle
    // For now, let's redirect to a UI-avatar service as a robust fallback
    const name = role || 'User';
    const color = role === 'admin' ? '7c3aed' : role === 'doctor' ? '10b981' : '3b82f6';
    return res.redirect(`https://ui-avatars.com/api/?name=${name}&background=${color}&color=fff&size=128`);
  }
}
