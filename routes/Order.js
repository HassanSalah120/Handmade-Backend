const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const {
  createCashOrder,
  updateOrderToDelivered,
  updateOrderToPaid,
  findAllOrders,
  filterOrderForLoggedUser,
  checkoutSession,
  createPaymentIntent,
} = require("../controller/orderController");
const { deleteOne } = require("../controller/handlersFactory");
const Order = require("../models/orderModel");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(
    filterOrderForLoggedUser,
    restrictTo("user", "admin", "artisan"),
    findAllOrders
  );
router.get("/checkout-session/:cartId", checkoutSession);

router.route("/:cartId").post(restrictTo("user", "admin"), createCashOrder);

// New route for creating Payment Intent
router.post("/create-payment-intent/:cartId", createPaymentIntent);

// router.route("/:id").get(restrictTo("admin", "artisan"), getOrder);

router.put("/:id/pay", restrictTo("admin", "artisan"), updateOrderToPaid);
router.put(
  "/:id/deliver",
  restrictTo("admin", "artisan"),
  updateOrderToDelivered
);

// Add DELETE endpoint for orders
router.delete("/:id", restrictTo("admin"), deleteOne(Order));

module.exports = router;
