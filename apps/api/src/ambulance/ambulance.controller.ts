import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AmbulanceService } from './ambulance.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('ambulance')
export class AmbulanceController {
    constructor(private readonly service: AmbulanceService) { }

    @Get('packages')
    getPackages() {
        return this.service.findAllPackages();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('packages')
    createPackage(@Body() body: any) {
        return this.service.createPackage(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('subscribe')
    create(@Body() body: any, @Request() req: any) {
        return this.service.create(body, req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('my-subscriptions')
    getMySubscriptions(@Request() req: any) {
        return this.service.findByUserId(req.user.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(+id);
    }
}
