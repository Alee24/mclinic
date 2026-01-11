import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LaboratoryService } from './laboratory.service';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../users/entities/user.entity';

@Controller('laboratory')
export class LaboratoryController {
    constructor(private readonly labService: LaboratoryService) { }

    @Get('tests')
    getTests() {
        return this.labService.getTests();
    }

    @Post('tests')
    // @UseGuards(AuthGuard('jwt')) // TODO: Admin Guard
    createTest(@Body() body: any) {
        return this.labService.createTest(body);
    }

    @Get('seed')
    seed() {
        return this.labService.seedTests();
    }

    @Post('orders')
    @UseGuards(AuthGuard('jwt'))
    createOrder(@Request() req: any, @Body() body: any) {
        const patientId = req.user.role === UserRole.PATIENT ? req.user.id : body['patientId'];
        return this.labService.createOrder(patientId, body.testId, body);
    }

    @Get('orders')
    @UseGuards(AuthGuard('jwt'))
    getOrders(@Request() req: any) {
        return this.labService.getOrders(req.user);
    }

    @Get('orders/:id')
    @UseGuards(AuthGuard('jwt'))
    getOrder(@Param('id') id: string) {
        return this.labService.getOrderById(id);
    }

    @Patch('orders/:id/status')
    @UseGuards(AuthGuard('jwt'))
    updateStatus(@Param('id') id: string, @Body() body: { status: any }) {
        return this.labService.updateStatus(id, body.status);
    }

    @Post('orders/:id/results')
    @UseGuards(AuthGuard('jwt'))
    addResults(@Param('id') id: string, @Body() body: { results: any[] }) {
        return this.labService.addResults(id, body.results);
    }

    @Post('orders/:id/upload-report')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/reports',
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = file.originalname.split('.').pop();
                    cb(null, `report-${uniqueSuffix}.${ext}`);
                },
            }),
        }),
    )
    async uploadReport(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Body('notes') notes: string,
    ) {
        return this.labService.uploadReport(id, file.filename, notes);
    }
}
