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
    async triggerAlert(@Request() req: any, @Body() body: { lat: number; lng: number; notes?: string }) {
        let medicId: number | null = null;
        let notes = body.notes || '';

        const isPatient = req.user && req.user.role === 'patient';
        if (!isPatient) {
            medicId = req.user.doctorId || req.user.sub || req.user.id;
        } else {
            notes = `Patient Emergency Evacuation Request: User #${req.user.id} (${req.user.email}) - Active Ambulance Subscription`;
        }

        return this.emergencyService.create(medicId, body.lat, body.lng, notes);
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

    @Post(':id/resolve')
    async resolveAlert(@Param('id') id: string, @Body() body: { notes?: string }) {
        return this.emergencyService.resolve(+id, body.notes || 'Resolved by admin');
    }
}
