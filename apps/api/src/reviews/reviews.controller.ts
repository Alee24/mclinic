import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createReviewDto: any, @Request() req: any) {
        // Ensure patientId comes from token if not provided (though DTO usually has it or we inject it)
        return this.reviewsService.create({ ...createReviewDto, patientId: req.user.id });
    }

    @Get('doctor/:id')
    findAllByDoctor(@Param('id') id: string) {
        return this.reviewsService.findAllByDoctor(+id);
    }
}
