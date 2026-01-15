
const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'm-cl-app',
    password: 'Mclinic@App2023?',
    database: 'mclinicportal',
    entities: [],
    synchronize: false,
});

async function run() {
    try {
        await AppDataSource.initialize();
        console.log('✅ DB Connected');

        await AppDataSource.query('UPDATE users SET status = 1 WHERE status = 0 OR status IS NULL');
        console.log('✅ Updated users to active (status = 1)');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

run();
