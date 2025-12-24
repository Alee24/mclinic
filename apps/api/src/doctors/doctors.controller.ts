import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('doctors')
export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Request() req: any, @Body() createDoctorDto: any) {
        return this.doctorsService.create(createDoctorDto, req.user);
    }

    @Get()
    findAll() {
        return this.doctorsService.findAllVerified();
    }

    @Get('admin/all')
    findAllAdmin() {
        return this.doctorsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.doctorsService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id/verify')
    verifyDoctor(@Param('id') id: string, @Body('status') status: boolean) {
        return this.doctorsService.verifyDoctor(+id, status);
    }
}
