import { Controller, Get, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { MedicalProfilesService } from './medical-profiles.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('medical-profiles')
@UseGuards(AuthGuard('jwt'))
export class MedicalProfilesController {
    constructor(private readonly service: MedicalProfilesService) { }

    @Get('me')
    getProfile(@Request() req: any) {
        return this.service.findByUserId(req.user.id);
    }

    @Get('user/:userId')
    getProfileByUser(@Param('userId') userId: string) {
        return this.service.findByUserId(+userId);
    }

    @Patch('me')
    updateProfile(@Request() req: any, @Body() body: any) {
        return this.service.update(req.user.id, body);
    }
}
