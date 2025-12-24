import { Controller, Get, Post, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('patients')
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    // @UseGuards(AuthGuard('jwt')) // Temporarily disabled for testing
    @Post()
    create(@Body() createPatientDto: any) {
        return this.patientsService.create(createPatientDto, null);
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

    // @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePatientDto: any) {
        return this.patientsService.update(+id, updatePatientDto);
    }
}
