import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Doctor } from '../doctors/entities/doctor.entity';

@Injectable()
export class MigrationService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Doctor)
        private doctorRepository: Repository<Doctor>,
        private dataSource: DataSource,
    ) { }

    async clearDatabase() {
        // Use a query runner to ensure we use the SAME connection for all queries
        // This is critical for SET FOREIGN_KEY_CHECKS to apply to the subsequent commands
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            console.log('[MIGRATION] Starting Database Clear...');

            // Disable foreign key checks
            await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');

            // List of tables to clear
            // Order doesn't strictly matter with FK checks off, but good practice to follow dependency
            const tables = [
                'doctor_specialities', // Pivot table
                'invoice_items',
                'invoices',
                'transactions',
                'wallets',
                'service_prices',
                'payment_configs',
                'appointments',
                'doctor_schedules',
                'doctor_licences',
                'reviews',
                'medical_records',
                'doctors',
                'departments',
                'specialities',
                'locations',
                'services',
                'users'
            ];

            for (const table of tables) {
                try {
                    console.log(`[MIGRATION] Clearing table: ${table}`);
                    // Use TRUNCATE as it resets auto-increment and is faster
                    await queryRunner.query(`TRUNCATE TABLE ${table}`);
                } catch (e: any) {
                    // Ignore if table doesn't exist
                    if (e.errno === 1146 || e.code === 'ER_NO_SUCH_TABLE') {
                        console.log(`[MIGRATION] Table ${table} does not exist. Skipping...`);
                        continue;
                    }

                    console.warn(`[MIGRATION] TRUNCATE failed for ${table}, trying DELETE. Error: ${e.message}`);
                    try {
                        await queryRunner.query(`DELETE FROM ${table}`);
                    } catch (delErr: any) {
                        if (delErr.errno === 1146 || delErr.code === 'ER_NO_SUCH_TABLE') {
                            console.log(`[MIGRATION] Table ${table} does not exist. Skipping...`);
                            continue;
                        }
                        console.error(`[MIGRATION] DELETE also failed for ${table}: ${delErr.message}`);
                        // We might want to throw here, but continuing might clear what CAN be cleared.
                        // For "Clear DB" expecting total wipe, throwing is safer to indicate failure.
                        throw delErr;
                    }
                }
            }

            console.log('[MIGRATION] Database cleared successfully.');

            // Re-seed Default Admin
            try {
                const adminExists = await this.userRepository.findOne({ where: { email: 'mettoalex@gmail.com' } });
                if (!adminExists) {
                    await this.userRepository.save({
                        fname: 'Metto',
                        lname: 'Alex',
                        email: 'mettoalex@gmail.com',
                        password: 'Digital2025', // In real app, hash this!
                        role: UserRole.ADMIN,
                        status: true
                    });
                    console.log('[MIGRATION] Default admin account restored.');
                }
            } catch (seedErr) {
                console.error('[MIGRATION] Failed to restore admin:', seedErr);
            }

            return { message: 'Database cleared successfully' };

        } catch (err) {
            console.error('[MIGRATION] Error clearing database:', err);
            throw err;
        } finally {
            // Re-enable foreign key checks on the same connection before releasing
            await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
            await queryRunner.release();
        }
    }

    /**
     * Parse SQL INSERT statement and extract rows
     */
    private parseInsertStatement(sqlContent: string): string[] {
        const valuesMatch = sqlContent.match(/VALUES\s*\n?([\s\S]*);/i);
        if (!valuesMatch) {
            throw new Error('Could not find VALUES clause in SQL');
        }

        const valuesString = valuesMatch[1];
        const rows: string[] = [];
        let currentRow = '';
        let inString = false;
        let stringChar: string | null = null;
        let parenDepth = 0;

        for (let i = 0; i < valuesString.length; i++) {
            const char = valuesString[i];
            const prevChar = i > 0 ? valuesString[i - 1] : '';

            // Track string boundaries
            if ((char === "'" || char === '"') && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                    stringChar = null;
                }
            }

            // Track parentheses depth
            if (!inString) {
                if (char === '(') parenDepth++;
                if (char === ')') parenDepth--;
            }

            currentRow += char;

            // When we close a row (parenDepth = 0 after closing paren)
            if (!inString && parenDepth === 0 && currentRow.trim().endsWith(')')) {
                const trimmed = currentRow.trim();
                if (trimmed.startsWith('(')) {
                    // Remove trailing comma if present
                    const cleanRow = trimmed.replace(/,\s*$/, '');
                    rows.push(cleanRow);
                }
                currentRow = '';
                // Skip any whitespace and comma after the row
                while (i + 1 < valuesString.length &&
                    (valuesString[i + 1] === ',' ||
                        valuesString[i + 1] === ' ' ||
                        valuesString[i + 1] === '\n' ||
                        valuesString[i + 1] === '\r')) {
                    i++;
                }
            }
        }

        return rows;
    }

    /**
     * Parse a single row of values
     */
    private parseRow(rowString: string): string[] {
        const content = rowString.slice(1, -1);
        const values: string[] = [];
        let current = '';
        let inString = false;
        let stringChar: string | null = null;
        let parenDepth = 0;

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const prevChar = i > 0 ? content[i - 1] : '';

            if ((char === "'" || char === '"') && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                    current += char;
                    continue;
                } else if (char === stringChar) {
                    inString = false;
                    current += char;
                    stringChar = null;
                    continue;
                }
            }

            if (!inString) {
                if (char === '(') parenDepth++;
                if (char === ')') parenDepth--;
            }

            if (char === ',' && !inString && parenDepth === 0) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.trim()) {
            values.push(current.trim());
        }

        return values;
    }

    /**
     * Clean and format a value
     */
    private cleanValue(value: string): string | null {
        if (value === 'NULL' || value === 'null') {
            return null;
        }

        if (
            (value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))
        ) {
            return value.slice(1, -1);
        }

        return value;
    }

    /**
     * Split full name into first and last name
     */
    private splitName(fullName: string): { fname: string; lname: string } {
        if (!fullName) return { fname: '', lname: '' };

        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) {
            return { fname: parts[0], lname: '' };
        }

        return {
            fname: parts[0],
            lname: parts.slice(1).join(' '),
        };
    }

    /**
     * Transform old user record to new schema
     */
    private transformUser(values: string[]): any {
        const name = this.cleanValue(values[1]);
        const email = this.cleanValue(values[2]);
        const password = this.cleanValue(values[4]);
        const mobile = this.cleanValue(values[5]);
        const address = this.cleanValue(values[6]);
        const status = this.cleanValue(values[8]);
        const profileImage = this.cleanValue(values[9]);
        const createdAt = this.cleanValue(values[10]);
        const updatedAt = this.cleanValue(values[11]);
        const isSuspended = this.cleanValue(values[12]);

        const { fname, lname } = this.splitName(name || '');
        const finalStatus = isSuspended === '1' ? 0 : parseInt(status || '1');

        return {
            email,
            password,
            mobile,
            address,
            status: finalStatus,
            created_at: createdAt,
            updated_at: updatedAt,
            fname,
            lname,
            profile_image: profileImage,
        };
    }

    /**
     * Transform old doctor record to new schema
     */
    private transformDoctor(values: string[]): any {
        // Based on user provided columns:
        // 0: id, 1: fname, 2: lname, 3: username, 4: national_id, 5: email, 6: dob, 7: reg_code,
        // 8: Verified_status, 9: approved_status, 10: password, 11: mobile, 12: address, 13: balance, 
        // 14: sex, 15: qualification, 16: speciality, 17: dr_type, 18: about, 19: slot_type, 
        // 20: latitude, 21: longitude, 22: fee, 23: serial_or_slot, 24: start_time, 25: end_time, 
        // 26: serial_day, 27: max_serial, 28: duration, 29: department_id, 30: location_id, 
        // 31: licenceNo, 32: licenceExpiry, 33: residance, 34: featured, 35: status, 
        // 36: created_at, 37: updated_at, 38: profile_image

        return {
            fname: this.cleanValue(values[1]),
            lname: this.cleanValue(values[2]),
            username: this.cleanValue(values[3]),
            national_id: this.cleanValue(values[4]),
            email: this.cleanValue(values[5]),
            dob: this.cleanValue(values[6]),
            reg_code: this.cleanValue(values[7]),
            Verified_status: parseInt(this.cleanValue(values[8]) || '0'),
            approved_status: this.cleanValue(values[9]),
            password: this.cleanValue(values[10]),
            mobile: this.cleanValue(values[11]),
            address: this.cleanValue(values[12]),
            balance: parseFloat(this.cleanValue(values[13]) || '0'),
            sex: this.cleanValue(values[14]),
            qualification: this.cleanValue(values[15]),
            speciality: this.cleanValue(values[16]),
            dr_type: this.cleanValue(values[17]),
            about: this.cleanValue(values[18]),
            slot_type: parseInt(this.cleanValue(values[19]) || '0'),
            latitude: parseFloat(this.cleanValue(values[20]) || '0'),
            longitude: parseFloat(this.cleanValue(values[21]) || '0'),
            fee: parseInt(this.cleanValue(values[22]) || '0'),
            serial_or_slot: this.cleanValue(values[23]),
            start_time: this.cleanValue(values[24]),
            end_time: this.cleanValue(values[25]),
            serial_day: parseInt(this.cleanValue(values[26]) || '0'),
            max_serial: parseInt(this.cleanValue(values[27]) || '0'),
            duration: parseInt(this.cleanValue(values[28]) || '0'),
            department_id: parseInt(this.cleanValue(values[29]) || '0'),
            location_id: parseInt(this.cleanValue(values[30]) || '0'),
            licenceNo: this.cleanValue(values[31]),
            licenceExpiry: this.cleanValue(values[32]),
            residance: this.cleanValue(values[33]),
            featured: parseInt(this.cleanValue(values[34]) || '0'),
            status: parseInt(this.cleanValue(values[35]) || '0'),
            created_at: this.cleanValue(values[36]),
            updated_at: this.cleanValue(values[37]),
            profile_image: this.cleanValue(values[38]),
        };
    }

    /**
     * Preview data before migration
     */
    async previewData(sqlContent: string, dataType: string) {
        try {
            const rows = this.parseInsertStatement(sqlContent);
            const sample = [];

            // Get first 10 records for preview
            for (let i = 0; i < Math.min(10, rows.length); i++) {
                const values = this.parseRow(rows[i]);
                const transformed = dataType === 'doctors' ? this.transformDoctor(values) : this.transformUser(values);
                sample.push(transformed);
            }

            return {
                type: dataType,
                sample,
                total: rows.length,
            };
        } catch (error) {
            throw new Error(`Failed to preview data: ${error.message}`);
        }
    }

    /**
     * Execute migration
     */
    async executeMigration(sqlContent: string, dataType: string) {
        const stats: {
            totalRecords: number;
            transformed: number;
            skipped: number;
            errors: string[];
        } = {
            totalRecords: 0,
            transformed: 0,
            skipped: 0,
            errors: [],
        };

        try {
            const rows = this.parseInsertStatement(sqlContent);
            stats.totalRecords = rows.length;

            for (let i = 0; i < rows.length; i++) {
                try {
                    const values = this.parseRow(rows[i]);
                    const transformed = dataType === 'doctors' ? this.transformDoctor(values) : this.transformUser(values);

                    if (!transformed.email) {
                        stats.skipped++;
                        stats.errors.push(`Row ${i + 1}: Missing email`);
                        continue;
                    }

                    if (dataType === 'doctors') {
                        const existing = await this.doctorRepository.findOne({
                            where: { email: transformed.email },
                        });
                        if (existing) {
                            await this.doctorRepository.update(existing.id, transformed);
                        } else {
                            await this.doctorRepository.save(transformed);
                        }
                    } else {
                        const existing = await this.userRepository.findOne({
                            where: { email: transformed.email },
                        });
                        if (existing) {
                            await this.userRepository.update(existing.id, transformed);
                        } else {
                            await this.userRepository.save(transformed);
                        }
                    }

                    stats.transformed++;
                } catch (error) {
                    stats.skipped++;
                    stats.errors.push(`Row ${i + 1}: ${error.message}`);
                }
            }

            return { stats };
        } catch (error) {
            throw new Error(`Migration failed: ${error.message}`);
        }
    }
}
