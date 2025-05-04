const { check } = require("express-validator");
const validatorMW = require("../../middlewares/validatorMW");
const slugify = require("slugify");
exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format..!!"),
  validatorMW,
];
exports.updateCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format..!!"),
  check("name")
    .notEmpty()
    .withMessage("Category name is required..!!")
    .isLength({ min: 3 })
    .withMessage("Category name is very short..!!")
    .isLength({ max: 32 })
    .withMessage("Category name is very long..!!")
    .custom((val, { req }) => (req.body.slug = slugify(val))),
  validatorMW,
];
exports.deleteCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid ID format..!!"),
  validatorMW,
];

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category name is required..!!")
    .isLength({ min: 3 })
    .withMessage("Category name is very short..!!")
    .isLength({ max: 32 })
    .withMessage("Category name is very long..!!")
    .custom((val, { req }) => (req.body.slug = slugify(val))),
  validatorMW,
];
