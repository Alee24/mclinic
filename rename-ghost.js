const mysql = require('mysql2/promise');

async function renameGhost() {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "mclinicportal"
        });

        console.log("Attempting to rename ghost table...");
        try {
            await connection.execute('RENAME TABLE doctors TO doctors_ghost_' + Date.now());
            console.log("Renamed successfully!");
        } catch (e) {
            console.error("Rename failed:", e.message);
        }

        await connection.end();
    } catch (error) {
        console.error("Error during rename:", error);
    }
}

renameGhost();
