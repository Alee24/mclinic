import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import * as path from 'path';

// Use absolute paths relative to this file to find the .env file reliably on VPS
const envPath = path.resolve(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.log(`[DB-CONFIG] Warning: Could not load .env from ${envPath}`);
    // Try monorepo root
    const rootEnvPath = path.resolve(__dirname, '../../../.env');
    const rootResult = dotenv.config({ path: rootEnvPath });
    
    if (rootResult.error) {
        console.log(`[DB-CONFIG] Warning: Could not load .env from monorepo root ${rootEnvPath}`);
        // Try fallback to process.cwd()
        const fallbackResult = dotenv.config({ path: path.resolve(process.cwd(), '.env') });
        if (fallbackResult.error) {
            console.log(`[DB-CONFIG] Error: Could not load .env from process.cwd() either.`);
        } else {
            console.log(`[DB-CONFIG] Success: Loaded .env from process.cwd()`);
        }
    } else {
        console.log(`[DB-CONFIG] Success: Loaded .env from monorepo root ${rootEnvPath}`);
    }
} else {
    console.log(`[DB-CONFIG] Success: Loaded .env from ${envPath}`);
}

// Security Check: If password is still empty, alert the logs
if (!process.env.DB_PASSWORD) {
    console.log(`[DB-CONFIG] CRITICAL: DB_PASSWORD is not set in environment!`);
}

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'm_clinic',
    synchronize: false,
    logging: false,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    subscribers: [],
});
