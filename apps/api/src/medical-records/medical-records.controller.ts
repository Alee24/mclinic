import { Controller, Get, Post, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from '../appointments/appointments.service';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly appointmentsService: AppointmentsService,
  ) { }

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
    const appointmentId = +id;
    const currentUserId = req.user.sub || req.user.id;
    const userRole = req.user.role;

    const appointment = await this.appointmentsService.findOne(appointmentId);
    if (!appointment) {
      throw new ForbiddenException('Appointment not found');
    }

    // Authorization check: Only allow if:
    // 1. User is the patient for this appointment
    // 2. User is the doctor for this appointment
    // 3. User is admin
    const isPatient = Number(appointment.patientId || appointment.patient?.id) === Number(currentUserId);
    
    // For doctor check, we need to check if the user's doctor profile ID matches the appointment's doctorId
    // But for simplicity in this check, we can also check if the user has a medic role.
    // However, the best way is to check the doctor profile's user_id.
    const isDoctor = (appointment.doctorId && Number(appointment.doctorId) === Number(currentUserId)) || 
                     (appointment.doctor && Number(appointment.doctor.user_id) === Number(currentUserId));

    if (
      !isPatient &&
      !isDoctor &&
      userRole !== 'admin'
    ) {
      throw new ForbiddenException('You do not have permission to view records for this appointment');
    }

    return this.medicalRecordsService.findByAppointment(appointmentId);
  }
}
