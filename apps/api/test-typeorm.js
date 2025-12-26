const { DataSource } = require('typeorm');

const AppDataSource = new DataSource({
    type: "mysql",
    host: "127.0.0.1",
    port: 3306,
    username: "root",
    password: "",
    database: "mclinic",
    synchronize: true,
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
        process.exit(1);
    });
