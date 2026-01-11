import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('recommendations')
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() body: any) {
        return this.recommendationsService.create(body);
    }

    @Get('appointment/:id')
    @UseGuards(AuthGuard('jwt'))
    findByAppointment(@Param('id') id: string) {
        return this.recommendationsService.findByAppointment(+id);
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'))
    updateStatus(@Param('id') id: string, @Body() body: { status: any }) {
        return this.recommendationsService.updateStatus(+id, body.status);
    }

    @Get('seed')
    seed() {
        return this.recommendationsService.seedServices();
    }
}
