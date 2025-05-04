const { check } = require("express-validator");
const validatorMW = require("../../middlewares/validatorMW");
const slugify = require("slugify");
const Category = require("../../models/subCategoryModel");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format..!!"),
  validatorMW,
];
exports.updateSUbCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format..!!"),
  check("name")
    .notEmpty()
    .withMessage("Subcategory name is required..!!")
    .isLength({ min: 3 })
    .withMessage("Subcategory name is very short..!!")
    .isLength({ max: 32 })
    .withMessage("Subcategory name is very long..!!")
    .custom((val, { req }) => (req.body.slug = slugify(val))),
  validatorMW,
];
exports.deleteSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format..!!"),
  validatorMW,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("SubCategory name is required..!!")
    .isLength({ min: 3 })
    .withMessage("SubCategory name is very short..!!")
    .isLength({ max: 32 })
    .withMessage("SubCategory name is very long..!!")
    .custom((val, { req }) => (req.body.slug = slugify(val))),
  check("image").optional(),
  check("category")
    .notEmpty()
    .withMessage("Subcategory must be belong to category..!!")
    .isMongoId()
    .withMessage("Invalid Id Format..!!")
    .custom(async (val) => {
      const category = await Category.findById(val);
      if (!category) {
        return Promise.reject(new Error("No category found for this ID..!!"));
      }
    }),
  validatorMW,
];
