const mongoose = require("mongoose");
const Product = require("../models/productModel");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "user",
//     select: "name profile_picture -_id",
//   }).populate({
//     path: "product",
//     select: "title -_id",
//   });
//   next();
// });

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name" });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: null,
      ratingsQuantity: 0,
    });
  }
};

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function (nxt) {
  // Access the query conditions
  const query = this.getQuery(); // This gets the conditions for findOneAnd operations

  // You can now use the query to find the document manually
  const review = await this.model.findOne(query); // Use `this.model` to access the model

  // console.log(review); // Log the review
  this.r = review; // Store the result if needed

  nxt();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.product);
});

module.exports = mongoose.model("Review", reviewSchema);
