const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const {
  createCoupon,
  deleteCoupon,
  getCoupon,
  getCoupons,
  updateCoupon,
} = require("../controller/couponController");

const router = express.Router();

router.use(protect, restrictTo("admin", "artisan"));

router.route("/").get(getCoupons).post(createCoupon);
router.route("/:id").get(getCoupon).delete(deleteCoupon).patch(updateCoupon);

module.exports = router;
