import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { AuthGuard } from '@nestjs/passport';
// import { RolesGuard } from '../auth/guards/roles.guard'; // Assuming you have roles
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
export class SystemSettingsController {
    constructor(private readonly settingsService: SystemSettingsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllSettings() {
        // TODO: Enforce ADMIN role check here.
        return await this.settingsService.getAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':key')
    async getSetting(@Param('key') key: string) {
        return await this.settingsService.get(key);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async updateSettings(@Body() body: { settings: { key: string; value: string }[] }) {
        return await this.settingsService.updateSettings(body.settings);
    }
}
