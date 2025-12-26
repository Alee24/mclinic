import { MigrationService } from './migration.service';
export declare class MigrationController {
    private readonly migrationService;
    constructor(migrationService: MigrationService);
    previewData(file: Express.Multer.File, dataType: string): Promise<{
        type: string;
        sample: any[];
        total: number;
    }>;
    executeMigration(file: Express.Multer.File, dataType: string): Promise<{
        stats: {
            totalRecords: number;
            transformed: number;
            skipped: number;
            errors: string[];
        };
    }>;
    clearDatabase(): Promise<{
        message: string;
    }>;
}
