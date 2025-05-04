const fs = require("fs");
require("colors");
require("dotenv").config({ path: "../../config.env" });
const dbConn = require("../../config/dbConnection");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

dbConn();

const products = JSON.parse(fs.readFileSync("./productData.json"));
const users = JSON.parse(fs.readFileSync("./userData.json"));
const reviews = JSON.parse(fs.readFileSync("./reviewData.json"));

const insertData = async () => {
  try {
    await Product.create(products);
    await User.create(users);
    await Review.create(reviews);
    console.log("Data Inserted".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data Destroyed".red.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] == "-i") {
  insertData();
} else if (process.argv[2] == "-d") {
  destroyData();
}
