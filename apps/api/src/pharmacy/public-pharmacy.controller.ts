import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';

@Controller('public/pharmacy')
export class PublicPharmacyController {
    constructor(private readonly pharmacyService: PharmacyService) {}

    @Get('prescriptions/verify')
    async verifyPrescription(@Query('code') code: string) {
        if (!code) {
            throw new NotFoundException('Prescription code is required');
        }
        const prescription = await this.pharmacyService.verifyPrescriptionByCode(code);
        if (!prescription) {
            throw new NotFoundException('Prescription not found');
        }
        // Return as an array to match verify page expected format
        return [prescription];
    }
}
