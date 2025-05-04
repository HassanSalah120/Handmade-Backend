const { check } = require("express-validator");
const Category = require("../../models/categoryModel");
const Subcategory = require("../../models/subCategoryModel");
const validatorMW = require("../../middlewares/validatorMW");
const slugify = require("slugify");

exports.getProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format...!!!"),
  validatorMW,
];

exports.createProductValidator = [
  check("title")
    .notEmpty()
    .withMessage("Product Title is required..!!")
    .isLength({ min: 3 })
    .withMessage("Product Title must be at least 3 characters..!!")
    .isLength({ max: 100 })
    .withMessage("Product title must not exceed 100 characters...!!")
    .custom((val, { req }) => (req.body.slug = slugify(val))),
  check("description")
    .notEmpty()
    .withMessage("Product Description is required..!!")
    .isLength({ min: 20 })
    .withMessage("Product Description must be at least 20 characters..!!"),
  check("quantity")
    .notEmpty()
    .withMessage("Product quantity is required..!!")
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("sold")
    .optional()
    .isNumeric()
    .withMessage("Product quantity must be a number"),
  check("price")
    .notEmpty()
    .withMessage("Product price is required")
    .isNumeric()
    .withMessage("Product price must be a number")
    .isLength({ max: 32 })
    .withMessage("To long price"),
  check("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Product priceAfterDiscount must be a number")
    .toFloat()
    .custom((val, { req }) => {
      if (req.body.price <= val) {
        throw new Error("PriceAfterDiscount must be lower than price'");
      }
      return true;
    }),
  check("colors")
    .optional()
    .isArray()
    .withMessage("availableColors should be array of string"),
  check("imageCover").notEmpty().withMessage("Product imageCover is required"),
  check("images")
    .optional()
    .isArray()
    .withMessage("images should be array of string"),
  check("category")
    .notEmpty()
    .withMessage("Product must be belong to a category")
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom((categoryId) =>
      Category.findById(categoryId).then((category) => {
        if (!category) {
          return Promise.reject(
            new Error(`No Category for this id : ${categoryId}`)
          );
        }
      })
    ),
  check("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid ID Format")
    .custom((subCategoriesIds) =>
      Subcategory.find({ _id: { $exists: true, $in: subCategoriesIds } }).then(
        (docs) => {
          if (docs.length < 1 || docs.length !== subCategoriesIds.length) {
            return Promise.reject(new Error(`Invalid Subcategories IDs..!!`));
          }
        }
      )
    )
    .custom((val, { req }) =>
      Subcategory.find({ category: req.body.category }).then(
        (subCategories) => {
          let subcategoriesInDB = [];
          subCategories.forEach((subCategory) => {
            subcategoriesInDB.push(subCategory._id.toString());
          });
          const check = (targetVal, arr) =>
            targetVal.every((v) => arr.includes(v));
          if (!check(val, subcategoriesInDB)) {
            return Promise.reject(
              new Error("Subcategories not belong to Category..!!")
            );
          }
        }
      )
    ),
  check("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("ratingsAverage must be a number")
    .isFloat({ min: 1 })
    .withMessage("Rating must be above or equal 1.0")
    .isFloat({ max: 5 })
    .withMessage("Rating must be below or equal 5.0"),
  check("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("ratingsQuantity must be a number"),
  check("currency")
    .notEmpty()
    .withMessage("Product currency is required")
    .isIn(["USD", "EGP", "EUR"])
    .withMessage("Currency must be one of USD, EGP, or EUR."),
  check("materials")
    .notEmpty()
    .withMessage("Product materials is required")
    .isArray()
    .withMessage("Materials must be an array of strings."),
  validatorMW,
];

exports.updateProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format...!!!"),
  validatorMW,
];
exports.deleteProductValidator = [
  check("id").isMongoId().withMessage("Invalid ID Format...!!!"),
  validatorMW,
];
