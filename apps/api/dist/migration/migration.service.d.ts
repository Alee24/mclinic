import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
export declare class MigrationService {
    private userRepository;
    private doctorRepository;
    constructor(userRepository: Repository<User>, doctorRepository: Repository<Doctor>);
    private parseInsertStatement;
    private parseRow;
    private cleanValue;
    private splitName;
    private transformUser;
    private transformDoctor;
    previewData(sqlContent: string, dataType: string): Promise<{
        type: string;
        sample: any[];
        total: number;
    }>;
    executeMigration(sqlContent: string, dataType: string): Promise<{
        stats: {
            totalRecords: number;
            transformed: number;
            skipped: number;
            errors: string[];
        };
    }>;
}
