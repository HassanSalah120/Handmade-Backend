const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Coupon name is required..!!"],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, "Coupon expire time required"],
    },
    discount: {
      type: Number,
      required: [true, "Coupon discount value required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);

//advanced coupon => soon
/**
 * 
 * const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Coupon Schema
const couponSchema = new Schema({
  code: {               // The unique code users will enter
    type: String,
    required: true,
    unique: true,       // Ensures no duplicate codes
    uppercase: true,    // Optionally, enforce uppercase codes
  },
  name: {               // The internal name for the coupon
    type: String,
    required: true,
  },
  discountType: {       // Type of discount (percentage, fixed amount, etc.)
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'], // Limit to specific discount types
    required: true,
  },
  discountValue: {      // The value of the discount (e.g., 20% or $10)
    type: Number,
    required: true,
  },
  minOrderValue: {      // Minimum order value to apply the coupon
    type: Number,
    default: 0,
  },
  expiryDate: {         // Expiration date of the coupon
    type: Date,
  },
  usageLimit: {         // The total number of times the coupon can be used
    type: Number,
    default: 1,
  },
  usedCount: {          // The number of times the coupon has been used
    type: Number,
    default: 0,
  },
  status: {             // The status of the coupon (active, expired, etc.)
    type: String,
    enum: ['active', 'expired', 'disabled'],
    default: 'active',
  },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;

 */
