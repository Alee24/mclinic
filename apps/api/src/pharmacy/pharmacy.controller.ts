import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PharmacyService } from './pharmacy.service';
import { PrescriptionStatus } from './entities/prescription.entity';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('pharmacy')
export class PharmacyController {
    constructor(private readonly pharmacyService: PharmacyService) { }

    // --- Medications ---

    @Get('medications')
    getAllMedications() {
        return this.pharmacyService.findAllMedications();
    }

    @Get('medications/template')
    getTemplate(@Res() res: ExpressResponse) {
        const csv = this.pharmacyService.getMedicationTemplate();
        res.header('Content-Type', 'text/csv');
        res.attachment('medications_template.csv');
        return res.send(csv);
    }

    @Post('medications')
    createMedication(@Body() body: any) {
        return this.pharmacyService.createMedication(body);
    }

    @Patch('medications/:id')
    updateMedication(@Param('id') id: string, @Body() body: any) {
        return this.pharmacyService.updateMedication(+id, body);
    }

    @Delete('medications/:id')
    deleteMedication(@Param('id') id: string) {
        return this.pharmacyService.deleteMedication(+id);
    }

    @Post('medications/upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadMedications(@UploadedFile() file: Express.Multer.File) {
        return this.pharmacyService.uploadMedications(file);
    }

    // --- Prescriptions ---

    @Get('prescriptions')
    getAllPrescriptions() {
        return this.pharmacyService.getAllPrescriptions();
    }

    @Get('prescriptions/patient/:id')
    getPatientPrescriptions(@Param('id') id: string) {
        return this.pharmacyService.getPatientPrescriptions(+id);
    }

    @Post('prescriptions')
    createPrescription(@Body() body: any) {
        return this.pharmacyService.createPrescription(body);
    }

    @Patch('prescriptions/:id/status')
    updatePrescriptionStatus(
        @Param('id') id: string,
        @Body('status') status: PrescriptionStatus,
    ) {
        return this.pharmacyService.updatePrescriptionStatus(+id, status);
    }

    // --- Orders ---

    @Get('orders')
    getAllOrders() {
        return this.pharmacyService.getAllOrders();
    }

    @Get('orders/user/:id')
    getUserOrders(@Param('id') id: string) {
        return this.pharmacyService.getUserOrders(+id);
    }

    @Post('orders')
    createOrder(@Body() body: any) {
        return this.pharmacyService.createOrder(body);
    }

    @Patch('orders/:id/status')
    updateOrderStatus(
        @Param('id') id: string,
        @Body('status') status: any,
    ) {
        return this.pharmacyService.updateOrderStatus(id, status);
    }
}
