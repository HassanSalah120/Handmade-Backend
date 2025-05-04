const express = require("express");

const {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  deleteSubCategory,
  updateSubCategory,
  createFilterObj,
  setCategoryIdToBody,
} = require("../controller/subCategoryController");

const {
  createSubCategoryValidator,
  deleteSubCategoryValidator,
  updateSUbCategoryValidator,
  getSubCategoryValidator,
} = require("../utils/validators/subCategoryValidator");

const { protect, restrictTo } = require("../controller/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(
    setCategoryIdToBody,
    createSubCategoryValidator,
    protect,
    restrictTo("admin", "artisan"),
    createSubCategory
  )
  .get(createFilterObj, getSubCategories);
router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .delete(
    deleteSubCategoryValidator,
    protect,
    restrictTo("admin", "artisan"),
    deleteSubCategory
  )
  .patch(
    updateSUbCategoryValidator,
    protect,
    restrictTo("admin", "artisan"),
    updateSubCategory
  );

module.exports = router;
