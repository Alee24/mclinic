import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'mclinic',
    synchronize: false,
    logging: false,
});

AppDataSource.initialize()
    .then(async () => {
        const users = await AppDataSource.query(`SELECT id, email, mobile FROM users WHERE mobile LIKE '%724454757%'`);
        console.log("Users:", users);
        
        const doctors = await AppDataSource.query(`SELECT id, email, mobile FROM doctors WHERE mobile LIKE '%724454757%'`);
        console.log("Doctors:", doctors);
        
        process.exit(0);
    })
    .catch((error) => {
        console.log("Error:", error);
        process.exit(1);
    });
