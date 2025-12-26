import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewsRepository: Repository<Review>,
    ) { }

    create(createReviewDto: any) {
        const review = this.reviewsRepository.create(createReviewDto);
        return this.reviewsRepository.save(review);
    }

    findAllByDoctor(doctorId: number) {
        return this.reviewsRepository.find({
            where: { doctorId },
            relations: ['patient'],
            order: { createdAt: 'DESC' },
        });
    }
}
