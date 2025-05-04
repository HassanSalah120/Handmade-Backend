const Subcategory = require("../models/subCategoryModel");

const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./handlersFactory");

exports.createFilterObj = (req, res, nxt) => {
  let filterObj = {};

  if (req.params.categoryId) filterObj = { category: req.params.categoryId };

  req.filterObj = filterObj;
  nxt();
};

// @desc    Get a list of subcategories
// @route   GET /api/v1/subcategories
// @access  Public
exports.getSubCategories = getAll(Subcategory);

exports.setCategoryIdToBody = (req, res, nxt) => {
  if (!req.body.category) req.body.category = req.params.categoryId;
  nxt();
};

// @desc    Create a new subcategory
// @route   POST /api/v1/subcategories
// @access  Private/Admin-Artisan
exports.createSubCategory = createOne(Subcategory);
// @desc    Get a specific subcategory by id
// @route   GET /api/v1/subcategories/:id
// @access  Public
exports.getSubCategory = getOne(Subcategory);

// @desc    Update a specific subcategory by id
// @route   PATCH /api/v1/subcategories/:id
// @access  Private/Admin-Artisan
exports.updateSubCategory = updateOne(Subcategory);

// @desc    Delete a specific subcategory by id
// @route   DELETE /api/v1/subcategories/:id
// @access  Private/Admin-Artisan
exports.deleteSubCategory = deleteOne(Subcategory);
