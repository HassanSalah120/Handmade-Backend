const { check } = require("express-validator");
const validatorMW = require("../../middlewares/validatorMW");
const slugify = require("slugify");

exports.signUpValidator = [
  check("name")
    .notEmpty()
    .withMessage("User name is required..!!")
    .isLength({ min: 3 })
    .withMessage("Name is very short..!!")
    .isLength({ max: 32 })
    .withMessage("Name is very long..!!")
    .custom((val, { req }) => (req.body.slug = slugify(val))),
  check("email")
    .notEmpty()
    .withMessage("E-mail is required..!!")
    .isEmail()
    .withMessage("Invalid email format..!!"),
  check("password")
    .notEmpty()
    .withMessage("User password is required..!!")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters..!!"),
  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password confirm is required..!!")
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error("Password do not match..!!");
      }
      return true;
    }),
  check("photo").optional(),
  validatorMW,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email address is required..!!")
    .isEmail()
    .withMessage("Invalid email format..!!"),
  check("password")
    .notEmpty()
    .withMessage("password field is required..!!")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters..!!"),
  validatorMW,
];
