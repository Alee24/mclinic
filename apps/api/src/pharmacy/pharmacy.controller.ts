import { Controller, Get, Post, Body, Param, Patch, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { PharmacyService } from './pharmacy.service';
import { PrescriptionStatus } from './entities/prescription.entity';

// Optional: Add Auth Guards if needed globally, but keeping simple for MVP integration first
@Controller('pharmacy')
export class PharmacyController {
    constructor(private readonly pharmacyService: PharmacyService) { }

    // --- Medications ---

    @Get('medications')
    getAllMedications() {
        return this.pharmacyService.findAllMedications();
    }

    @Post('medications')
    createMedication(@Body() body: any) {
        return this.pharmacyService.createMedication(body);
    }

    @Post('medications/upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadMedications(@UploadedFile() file: Express.Multer.File) {
        return this.pharmacyService.uploadMedications(file);
    }

    @Get('medications/template')
    getMedicationTemplate(@Res() res: any) {
        const csv = this.pharmacyService.getMedicationTemplate();
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=medication_template.csv');
        res.send(csv);
    }

    // --- Prescriptions ---

    @Post('prescriptions')
    createPrescription(@Body() body: any) {
        return this.pharmacyService.createPrescription(body);
    }

    @Get('prescriptions')
    getAllPrescriptions() {
        return this.pharmacyService.getAllPrescriptions();
    }

    @Get('prescriptions/patient/:id')
    getPatientPrescriptions(@Param('id') id: string) {
        return this.pharmacyService.getPatientPrescriptions(+id);
    }

    @Get('prescriptions/doctor/:id')
    getDoctorPrescriptions(@Param('id') id: string) {
        return this.pharmacyService.getDoctorPrescriptions(+id);
    }

    @Get('prescriptions/:id')
    getPrescription(@Param('id') id: string) {
        return this.pharmacyService.findPrescriptionById(+id);
    }

    @Get('prescriptions/appointment/:id')
    getAppointmentPrescriptions(@Param('id') id: string) {
        return this.pharmacyService.findPrescriptionsByAppointment(+id);
    }

    @Patch('prescriptions/:id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: PrescriptionStatus) {
        return this.pharmacyService.updatePrescriptionStatus(+id, status);
    }

    // --- Orders ---

    @Post('orders')
    createOrder(@Body() body: any) {
        return this.pharmacyService.createOrder(body);
    }

    @Get('orders/user/:userId')
    getUserOrders(@Param('userId') userId: string) {
        return this.pharmacyService.getUserOrders(userId);
    }

    @Get('orders')
    getAllOrders() {
        return this.pharmacyService.getAllOrders();
    }

    @Patch('orders/:id/status')
    updateOrderStatus(@Param('id') id: string, @Body('status') status: any) {
        return this.pharmacyService.updateOrderStatus(id, status);
    }
}
