const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist
// @access  Protected/User
exports.addProductToWishList = asyncHandler(async (req, res, nxt) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "Success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/:productId
// @access  Protected/User
exports.removeProductFromWishList = asyncHandler(async (req, res, nxt) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: user.wishlist,
  });
});

// @desc    Get logged user wishlist
// @route   GET /api/v1/wishlist
// @access  Protected/User
exports.getLoggedUserWishlist = asyncHandler(async (req, res, nxt) => {
  const user = await User.findById(req.user.id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    data: user.wishlist,
  });
});