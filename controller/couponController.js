const Coupon = require("../models/couponMode");

const {
  getAll,
  getOne,
  deleteOne,
  updateOne,
  createOne,
} = require("./handlersFactory");

exports.getCoupons = getAll(Coupon);

exports.createCoupon = createOne(Coupon);

exports.getCoupon = getOne(Coupon);

exports.deleteCoupon = deleteOne(Coupon);

exports.updateCoupon = updateOne(Coupon);

