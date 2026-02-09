import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
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
  @Get()
  async findMyRecords(@Request() req: any) {
    // Return medical records for the authenticated user
    const userId = req.user.sub || req.user.id;
    return this.medicalRecordsService.findByPatient(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('patient/:id')
  async findByPatient(@Param('id') id: string, @Request() req: any) {
    const requestedPatientId = +id;
    const currentUserId = req.user.sub || req.user.id;
    const userRole = req.user.role;

    // Authorization check: Only allow if:
    // 1. User is viewing their own records
    // 2. User is admin
    // 3. User is a doctor/medic (they need to see patient records)
    if (
      requestedPatientId !== currentUserId &&
      userRole !== 'admin' &&
      !['doctor', 'medic', 'nurse', 'clinician'].includes(userRole)
    ) {
      throw new ForbiddenException('You do not have permission to view these medical records');
    }

    return this.medicalRecordsService.findByPatient(requestedPatientId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('appointment/:id')
  async findByAppointment(@Param('id') id: string, @Request() req: any) {
    // Get records by appointment
    // TODO: Add ownership verification - check if user is patient or doctor for this appointment
    return this.medicalRecordsService.findByAppointment(+id);
  }
}
