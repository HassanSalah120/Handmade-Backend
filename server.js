const app = require("./app");

const dbConn = require("./config/dbConnection");

dbConn();

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`App Running on port: ${port}...`)
);

process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error("Shutting Down....");
    process.exit(1);
  });
});
