import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { AppointmentRecommendation } from './entities/appointment-recommendation.entity';
import { Service } from '../services/entities/service.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AppointmentRecommendation, Service])
    ],
    controllers: [RecommendationsController],
    providers: [RecommendationsService],
    exports: [RecommendationsService]
})
export class RecommendationsModule { }
