const express = require("express");
const { restrictTo, protect } = require("../controller/authController");
const {
  addProductToWishList,
  removeProductFromWishList,
  getLoggedUserWishlist,
} = require("../controller/wishListController");
const router = express.Router();

router.use(protect, restrictTo("user"));

router.route("/").post(addProductToWishList).get(getLoggedUserWishlist);
router.route("/:productId").delete(removeProductFromWishList);

module.exports = router;
