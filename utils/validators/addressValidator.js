const { check } = require("express-validator");
const validatorMW = require("../../middlewares/validatorMW");

exports.addAddressValidator = [
  check("alias").optional(),
  check("details")
    .notEmpty()
    .withMessage("Address details is required..!!")
    .isLength({ min: 3 })
    .withMessage("Details is very short..!!")
    .isLength({ max: 50 })
    .withMessage("Details is very long..!!"),
  check("phone")
    .notEmpty()
    .withMessage("Phone is required..!!")
    .isMobilePhone()
    .withMessage("Phone number must be a valid mobile number."),
  check("city").notEmpty().withMessage("City is required..!!"),
  check("postalCode")
    .optional()
    .isPostalCode()
    .withMessage("Postal code must be valid."),
  validatorMW,
];
exports.removeAddressValidator = [
  check("addressId").isMongoId().withMessage("Invalid id format..!!"),
  validatorMW,
];
