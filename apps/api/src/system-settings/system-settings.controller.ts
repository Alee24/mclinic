import { Controller, Get, Post, Body, UseGuards, Param, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import * as express from 'express';
import { SystemSettingsService } from './system-settings.service';

@Controller('settings')
export class SystemSettingsController {
    constructor(private settingsService: SystemSettingsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllSettings() {
        return await this.settingsService.getAll();
    }

    @Get('logo-image/active')
    async getActiveLogo(@Res() res: express.Response) {
        const logoPathOrUrl = await this.settingsService.get('COMPANY_LOGO_URL');
        
        if (!logoPathOrUrl) {
            return res.redirect('https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png');
        }

        if (logoPathOrUrl.startsWith('http')) {
            return res.redirect(logoPathOrUrl);
        }

        // It is a local file
        const filePath = join(process.cwd(), 'apps', 'api', 'uploads', 'logo', logoPathOrUrl);
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }

        // Legacy fallback
        const legacyPath = join(__dirname, '..', '..', 'uploads', 'logo', logoPathOrUrl);
        if (fs.existsSync(legacyPath)) {
            return res.sendFile(legacyPath);
        }

        return res.redirect('https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png');
    }

    @Get('logo-image/:filename')
    async getLogoImage(@Param('filename') filename: string, @Res() res: express.Response) {
        const filePath = join(process.cwd(), 'apps', 'api', 'uploads', 'logo', filename);
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }

        const legacyPath = join(__dirname, '..', '..', 'uploads', 'logo', filename);
        if (fs.existsSync(legacyPath)) {
            return res.sendFile(legacyPath);
        }

        return res.redirect('https://mclinic.co.ke/wp-content/uploads/2025/04/M-Clinic-Logo.png');
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('upload-logo')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const dest = join(process.cwd(), 'apps', 'api', 'uploads', 'logo');
                    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
                    cb(null, dest);
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = file.originalname.split('.').pop();
                    cb(null, `logo-${uniqueSuffix}.${ext}`);
                },
            }),
        }),
    )
    async uploadLogo(@UploadedFile() file: Express.Multer.File) {
        return { filename: file.filename };
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
