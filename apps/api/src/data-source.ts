import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import * as path from 'path';

// Use absolute paths relative to this file to find the .env file reliably on VPS
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // Fallback for various execution contexts

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
