const { createConnection } = require('typeorm');
const path = require('path');

async function check() {
    try {
        const connection = await createConnection({
            type: "mysql",
            host: "localhost",
            port: 3306,
            username: "root",
            password: "",
            database: "mclinicportal",
            entities: [
                path.join(__dirname, "apps/api/src/**/*.entity.ts")
            ],
            synchronize: false,
        });

        const doctorCount = await connection.getRepository("Doctor").count();
        const userCount = await connection.getRepository("User").count();

        const roles = ['doctor', 'medic', 'nurse', 'clinician', 'lab_tech', 'pharmacist', 'admin'];
        const providersInUsers = await connection.getRepository("User").count({
            where: roles.map(role => ({ role }))
        });

        console.log(`Doctors in 'doctors' table: ${doctorCount}`);
        console.log(`Users in 'users' table: ${userCount}`);
        console.log(`Users with provider roles: ${providersInUsers}`);

        await connection.close();
    } catch (error) {
        console.error("Error during check:", error);
    }
}

check();
