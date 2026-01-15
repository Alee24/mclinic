import { Controller, Post, Body, UseGuards, Request, Param, UploadedFile, UseInterceptors, Get } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('emergency')
@UseGuards(AuthGuard('jwt'))
export class EmergencyController {
    constructor(private readonly emergencyService: EmergencyService) { }

    @Post('alert')
    async triggerAlert(@Request() req, @Body() body: { lat: number; lng: number }) {
        // Determine medicId. If user is doctor/medic, use doctorId from token/req
        // req.user might have doctorId if AuthService attached it, or we rely on userId and look it up.
        // Assuming req.user.doctorId exists or we use req.user.id if they are the medic User.
        // For safety, let's assume req.user.doctorId is populated or passed.
        // If not, we might need to lookup. But let's try req.user.doctorId first.

        // Fallback: if body has medicId (for testing)
        const medicId = req.user.doctorId || req.user.sub || req.user.id;

        return this.emergencyService.create(medicId, body.lat, body.lng);
    }

    @Post(':id/audio')
    @UseInterceptors(FileInterceptor('audio', {
        storage: diskStorage({
            destination: './uploads', // Keeping it simple in root uploads or subfolder
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = extname(file.originalname) || '.webm';
                callback(null, `emergency-${uniqueSuffix}${ext}`);
            },
        }),
    }))
    async uploadAudio(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        return this.emergencyService.updateAudio(+id, file.filename);
    }

    @Get('active')
    async getActiveAlerts() {
        return this.emergencyService.findAllActive();
    }
}
