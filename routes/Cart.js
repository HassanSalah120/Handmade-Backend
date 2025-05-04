const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const {
  addProductToCart,
  getLoggedUserCart,
  removeItemFromCart,
  clearCart,
  applyCoupon,
  updateCartItemQuantity,
} = require("../controller/cartController");
const router = express.Router();

router.use(protect, restrictTo("user"));

router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router.patch("/applyCoupon", applyCoupon);

router
  .route("/:itemId")
  .delete(removeItemFromCart)
  .patch(updateCartItemQuantity);

module.exports = router;
