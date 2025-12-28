import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
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

    @Post('orders')
    @UseGuards(AuthGuard('jwt'))
    createOrder(@Request() req: any, @Body() body: { testId: number; patientId?: number }) {
        // Patient creates order for themselves
        // Or Admin creates for patient?
        // Assuming Patient self-order flow for now or Admin passing patientId

        // Example: Only Patient for self
        const patientId = req.user.role === UserRole.PATIENT ? req.user.id : body['patientId'];
        return this.labService.createOrder(patientId, body.testId);
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
}
