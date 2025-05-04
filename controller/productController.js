const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const sharp = require("sharp");
const {
  deleteOne,
  updateOne,
  getAll,
  getOne,
  createOne,
} = require("./handlersFactory");

const { uploadMixOfImages } = require("../middlewares/uploadImageMW");

exports.aliasTopProducts = (req, res, nxt) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "title,price,ratingsAverage,description,imageCover,colors";
  nxt();
};

exports.uploadProductImages = uploadMixOfImages([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 5 },
]);

exports.resizeProductImages = asyncHandler(async (req, res, nxt) => {
  if (!req.files.imageCover || !req.files.images) return nxt();

  req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/products/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${filename}`);

      req.body.images.push(filename);
    })
  );

  nxt();
});

// @desc     Get a list of products
// @route    GET /api/v1/products
// @access   Public
exports.getProducts = getAll(Product, "Product");

// @desc    Create Product
// @route   POST  /api/v1/products
// @access  Private/Admin-Artisan
exports.createProduct = createOne(Product);

// @desc    Get specific Product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = getOne(Product, { path: "reviews" });

// @desc    Update specific Product
// @route   PATCH /api/v1/products/:id
// @access  Private/Admin-Artisan
exports.updateProduct = updateOne(Product);

// @desc    Delete specific Product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
exports.deleteProduct = deleteOne(Product);
