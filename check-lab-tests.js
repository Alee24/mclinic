
const typeorm = require('typeorm');

const LabTestSchema = new typeorm.EntitySchema({
    name: "LabTest",
    tableName: "lab_test", // Explicitly mapping to likely table name
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar"
        },
        isActive: {
            type: "boolean",
            default: true
        },
        price: {
            type: "decimal",
            precision: 10,
            scale: 2
        }
    }
});

const AppDataSource = new typeorm.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "mclinic",
    entities: [LabTestSchema],
    synchronize: false,
});

AppDataSource.initialize()
    .then(async () => {
        console.log("Connected to database...");
        const repo = AppDataSource.getRepository("LabTest");
        try {
            const count = await repo.count();
            console.log(`Total Lab Tests: ${count}`);

            const activeCount = await repo.count({ where: { isActive: true } });
            console.log(`Active Lab Tests: ${activeCount}`);

            const allTests = await repo.find();
            console.log("Tests found:", JSON.stringify(allTests, null, 2));
        } catch (e) {
            console.error("Error querying repo:", e.message);
        }

        await AppDataSource.destroy();
    })
    .catch((error) => console.log("Init Error:", error));
