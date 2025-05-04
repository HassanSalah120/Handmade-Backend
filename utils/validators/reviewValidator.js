const { check, param } = require("express-validator");
const validatorMW = require("../../middlewares/validatorMW");
const Review = require("../../models/reviewModel");
exports.createReviewValidator = [
  check("review").optional(),
  check("rating")
    .notEmpty()
    .withMessage("Review rating value is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Review rating value must be between 1 to 5"),
  check("user")
    .notEmpty()
    .withMessage("Review must belong to a user")
    .isMongoId()
    .withMessage("Invalid Review id format"),
  check("product")
    .notEmpty()
    .withMessage("Review must belong to a product")
    .isMongoId()
    .withMessage("Invalid Review id format")
    .custom((val, { req }) =>
      Review.findOne({ user: req.user.id, product: req.body.product }).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error(`You already created a review before..!!`)
            );
          }
        }
      )
    ),
  // .custom((val, { req }) =>
  //   Review.findOne({ user: req.user.id, product: req.body.product }).then(
  //     (review) => {
  //       if (review) {
  //         Promise.reject(
  //           new Error(`You already created a review before..!!`)
  //         );
  //       }
  //     }
  //   )
  // )
  validatorMW,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMW,
];

exports.deleteReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id format"),
  validatorMW,
];

exports.updateReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review Id format..!!"),
  check("review").optional(),
  check("rating")
    .notEmpty()
    .withMessage("Review rating value is required")
    .isFloat({ min: 1, max: 5 })
    .withMessage("Review rating value must be between 1 to 5"),
  validatorMW,
];

exports.getReviewsValidator = [
  check("productId")
    .optional()
    .isMongoId()
    .withMessage("Invalid Id Format..!!"),
  validatorMW,
];
