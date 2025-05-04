const Category = require("../models/categoryModel");

const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./handlersFactory");

// @desc     Get a list of categories
// @route    GET /api/v1/categories
// @access   Public
exports.getCategories = getAll(Category);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private/Admin-Artisan
exports.createCategory = createOne(Category);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = getOne(Category);
// @desc    Update specific category
// @route   PATCH /api/v1/categories/:id
// @access  Private/Admin-Artisan
exports.updateCategory = updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
exports.deleteCategory = deleteOne(Category);
