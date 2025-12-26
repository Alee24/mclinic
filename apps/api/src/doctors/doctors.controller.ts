import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('doctors')
export class DoctorsController {
    constructor(private readonly doctorsService: DoctorsService) { }

    // @UseGuards(AuthGuard('jwt')) // Temporarily disabled for testing
    @Post()
    create(@Body() createDoctorDto: any) {
        return this.doctorsService.create(createDoctorDto, null);
    }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.doctorsService.findAllVerified(search);
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

    // @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDoctorDto: any) {
        return this.doctorsService.update(+id, updateDoctorDto);
    }
}
