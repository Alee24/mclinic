import { SeedingService } from './seeding.service';
export declare class SeedingController {
    private readonly seedingService;
    constructor(seedingService: SeedingService);
    runSeeding(): Promise<{
        message: string;
        counts: {
            patients: number;
            doctors: number;
            appointments: number;
            records: number;
            transactions: number;
        };
    }>;
    clearData(): Promise<{
        message: string;
    }>;
}
