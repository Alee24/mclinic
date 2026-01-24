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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usersService.findAll();
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
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/upload-profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profiles',
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
}
