import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
export declare class ReviewsService {
    private reviewsRepository;
    constructor(reviewsRepository: Repository<Review>);
    create(createReviewDto: any): Promise<Review[]>;
    findAllByDoctor(doctorId: number): Promise<Review[]>;
}
