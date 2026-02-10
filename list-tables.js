const mysql = require('mysql2/promise');

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "mclinicportal"
        });

        const [tables] = await connection.execute('SHOW TABLES');
        console.log("Tables in mclinicportal:");
        tables.forEach(t => console.log(Object.values(t)[0]));

        await connection.end();
    } catch (error) {
        console.error("Error during check:", error);
    }
}

check();
