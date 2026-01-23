import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SystemSettingsService } from './system-settings.service';

@Controller('settings')
export class SystemSettingsController {
    constructor(private settingsService: SystemSettingsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllSettings() {
        return await this.settingsService.getAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':key')
    async getSetting(@Param('key') key: string) {
        return await this.settingsService.get(key);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async updateSettings(@Body() body: any) {
        // Handle both structure with { settings: [...] } and direct array if ever changed
        const settings = body.settings || body;
        return await this.settingsService.updateSettings(settings);
    }
}
