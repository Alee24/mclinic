import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('medical-records')
export class MedicalRecordsController {
    constructor(private readonly medicalRecordsService: MedicalRecordsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createMedicalRecordDto: any) {
        return this.medicalRecordsService.create(createMedicalRecordDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('patient/:id')
    findByPatient(@Param('id') id: string) {
        return this.medicalRecordsService.findByPatient(+id);
    }
}
