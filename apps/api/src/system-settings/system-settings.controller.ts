import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SystemSettingsService } from './system-settings.service';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SettingItemDto {
    @IsString()
    key: string;

    @IsString()
    value: string;
}

class UpdateSettingsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SettingItemDto)
    settings: SettingItemDto[];
}

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
    async updateSettings(@Body() body: UpdateSettingsDto) {
        return await this.settingsService.updateSettings(body.settings);
    }
}
