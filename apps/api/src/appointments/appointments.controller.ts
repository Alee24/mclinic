import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './entities/appointment.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createAppointmentDto: any, @Request() req: any) {
    // Inject patientId from the authenticated user
    const patientId = req.user.sub || req.user.id;
    return this.appointmentsService.create({
      ...createAppointmentDto,
      patientId,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Request() req: any) {
    return this.appointmentsService.findAllForUser(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('diagnose-role')
  async diagnoseRole(@Request() req: any) {
    return this.appointmentsService.diagnoseUser(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-appointments')
  async findMyAppointments(@Request() req: any) {
    // Determine if user is doctor or patient and fetch relevant appointments
    // Simplified for now:
    return [];
  }

  @Get('patient/:id')
  findByPatient(@Param('id') id: string) {
    return this.appointmentsService.findByPatient(+id);
  }

  @Get('doctor/:id')
  findByDoctor(@Param('id') id: string) {
    return this.appointmentsService.findByDoctor(+id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOne(+id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.appointmentsService.updateStatus(+id, status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() body: { date: string; time: string },
  ) {
    return this.appointmentsService.reschedule(+id, body.date, body.time);
  }
}
