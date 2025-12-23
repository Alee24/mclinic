import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from './entities/appointment.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createAppointmentDto: any) {
        return this.appointmentsService.create(createAppointmentDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.appointmentsService.findAll();
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

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: AppointmentStatus) {
        return this.appointmentsService.updateStatus(+id, status);
    }
}
