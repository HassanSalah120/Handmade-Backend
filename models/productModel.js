const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Too short product title"],
      maxLength: [100, "Too long product title"],
      // unique: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      // unique: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minLength: [20, "Too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      trim: true,
      max: [20000000, "Too long product price"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],

    imageCover: {
      type: String,
      required: [true, "Product Image cover is required"],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "SubCategory",
      },
    ],
    currency: {
      type: String,
      required: true,
      enum: ["USD", "EGP", "EUR"], // List of allowed currencies
      default: "EGP",
    },
    materials: {
      type: [String], // Array of strings for materials
      default: [],
    },
    weight: {
      type: Number, // Weight in kilograms
    }, 
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.pre(/^find/, function (nxt) {
  this.populate({
    path: "category",
    select: "name -_id",
  });
  nxt();
});

module.exports = mongoose.model("Product", productSchema);

