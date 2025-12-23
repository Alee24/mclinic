import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req: any, @Body() createPatientDto: any) {
        return this.patientsService.create(createPatientDto, req.user);
    }

    @Get()
    findAll() {
        return this.patientsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.patientsService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Request() req: any) {
        return this.patientsService.findByUserId(req.user.userId);
    }
}
