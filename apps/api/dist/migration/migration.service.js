"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const doctor_entity_1 = require("../doctors/entities/doctor.entity");
let MigrationService = class MigrationService {
    userRepository;
    doctorRepository;
    dataSource;
    constructor(userRepository, doctorRepository, dataSource) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.dataSource = dataSource;
    }
    async clearDatabase() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            console.log('[MIGRATION] Starting Database Clear...');
            await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
            const tables = [
                'doctor_specialities',
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
                    await queryRunner.query(`TRUNCATE TABLE ${table}`);
                }
                catch (e) {
                    if (e.errno === 1146 || e.code === 'ER_NO_SUCH_TABLE') {
                        console.log(`[MIGRATION] Table ${table} does not exist. Skipping...`);
                        continue;
                    }
                    console.warn(`[MIGRATION] TRUNCATE failed for ${table}, trying DELETE. Error: ${e.message}`);
                    try {
                        await queryRunner.query(`DELETE FROM ${table}`);
                    }
                    catch (delErr) {
                        if (delErr.errno === 1146 || delErr.code === 'ER_NO_SUCH_TABLE') {
                            console.log(`[MIGRATION] Table ${table} does not exist. Skipping...`);
                            continue;
                        }
                        console.error(`[MIGRATION] DELETE also failed for ${table}: ${delErr.message}`);
                        throw delErr;
                    }
                }
            }
            console.log('[MIGRATION] Database cleared successfully.');
            try {
                const adminExists = await this.userRepository.findOne({ where: { email: 'mettoalex@gmail.com' } });
                if (!adminExists) {
                    await this.userRepository.save({
                        fname: 'Metto',
                        lname: 'Alex',
                        email: 'mettoalex@gmail.com',
                        password: 'Digital2025',
                        role: user_entity_1.UserRole.ADMIN,
                        status: true
                    });
                    console.log('[MIGRATION] Default admin account restored.');
                }
            }
            catch (seedErr) {
                console.error('[MIGRATION] Failed to restore admin:', seedErr);
            }
            return { message: 'Database cleared successfully' };
        }
        catch (err) {
            console.error('[MIGRATION] Error clearing database:', err);
            throw err;
        }
        finally {
            await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
            await queryRunner.release();
        }
    }
    parseInsertStatement(sqlContent) {
        const valuesMatch = sqlContent.match(/VALUES\s*\n?([\s\S]*);/i);
        if (!valuesMatch) {
            throw new Error('Could not find VALUES clause in SQL');
        }
        const valuesString = valuesMatch[1];
        const rows = [];
        let currentRow = '';
        let inString = false;
        let stringChar = null;
        let parenDepth = 0;
        for (let i = 0; i < valuesString.length; i++) {
            const char = valuesString[i];
            const prevChar = i > 0 ? valuesString[i - 1] : '';
            if ((char === "'" || char === '"') && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                }
                else if (char === stringChar) {
                    inString = false;
                    stringChar = null;
                }
            }
            if (!inString) {
                if (char === '(')
                    parenDepth++;
                if (char === ')')
                    parenDepth--;
            }
            currentRow += char;
            if (!inString && parenDepth === 0 && currentRow.trim().endsWith(')')) {
                const trimmed = currentRow.trim();
                if (trimmed.startsWith('(')) {
                    const cleanRow = trimmed.replace(/,\s*$/, '');
                    rows.push(cleanRow);
                }
                currentRow = '';
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
    parseRow(rowString) {
        const content = rowString.slice(1, -1);
        const values = [];
        let current = '';
        let inString = false;
        let stringChar = null;
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
                }
                else if (char === stringChar) {
                    inString = false;
                    current += char;
                    stringChar = null;
                    continue;
                }
            }
            if (!inString) {
                if (char === '(')
                    parenDepth++;
                if (char === ')')
                    parenDepth--;
            }
            if (char === ',' && !inString && parenDepth === 0) {
                values.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        if (current.trim()) {
            values.push(current.trim());
        }
        return values;
    }
    cleanValue(value) {
        if (value === 'NULL' || value === 'null') {
            return null;
        }
        if ((value.startsWith("'") && value.endsWith("'")) ||
            (value.startsWith('"') && value.endsWith('"'))) {
            return value.slice(1, -1);
        }
        return value;
    }
    splitName(fullName) {
        if (!fullName)
            return { fname: '', lname: '' };
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 1) {
            return { fname: parts[0], lname: '' };
        }
        return {
            fname: parts[0],
            lname: parts.slice(1).join(' '),
        };
    }
    transformUser(values) {
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
    transformDoctor(values) {
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
    async previewData(sqlContent, dataType) {
        try {
            const rows = this.parseInsertStatement(sqlContent);
            const sample = [];
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
        }
        catch (error) {
            throw new Error(`Failed to preview data: ${error.message}`);
        }
    }
    async executeMigration(sqlContent, dataType) {
        const stats = {
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
                        }
                        else {
                            await this.doctorRepository.save(transformed);
                        }
                    }
                    else {
                        const existing = await this.userRepository.findOne({
                            where: { email: transformed.email },
                        });
                        if (existing) {
                            await this.userRepository.update(existing.id, transformed);
                        }
                        else {
                            await this.userRepository.save(transformed);
                        }
                    }
                    stats.transformed++;
                }
                catch (error) {
                    stats.skipped++;
                    stats.errors.push(`Row ${i + 1}: ${error.message}`);
                }
            }
            return { stats };
        }
        catch (error) {
            throw new Error(`Migration failed: ${error.message}`);
        }
    }
};
exports.MigrationService = MigrationService;
exports.MigrationService = MigrationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(doctor_entity_1.Doctor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MigrationService);
//# sourceMappingURL=migration.service.js.map