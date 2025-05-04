const mongoose = require("mongoose");
module.exports = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((conn) => {
      console.log(conn.connection.host);
      console.log("Database connected Successfully...");
    })
    // .catch((err) => {
    //   console.log(err);
    // });
};
