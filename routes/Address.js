const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const {
  addAddress,
  removeAddress,
  getLoggedUserAddresses,
} = require("../controller/addressesController");

const {
  addAddressValidator,
  removeAddressValidator,
} = require("../utils/validators/addressValidator");

const router = express.Router();

router.use(protect, restrictTo("user"));
router
  .route("/")
  .post(addAddressValidator, addAddress)
  .get(getLoggedUserAddresses);
router.delete("/:addressId", removeAddressValidator, removeAddress);

module.exports = router;
