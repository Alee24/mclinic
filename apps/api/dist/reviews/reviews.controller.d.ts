import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(createReviewDto: any, req: any): Promise<import("./entities/review.entity").Review[]>;
    findAllByDoctor(id: string): Promise<import("./entities/review.entity").Review[]>;
}
