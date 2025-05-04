const Review = require("../models/reviewModel");

const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./handlersFactory");

exports.setProductAndUserIdToBody = (req, res, nxt) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;

  nxt();
};

exports.createFilterObj = (req, res, nxt) => {
  let filterObj = {};
  if (req.params.productId) filterObj = { product: req.params.productId };
  req.filterObj = filterObj;
  nxt();
};

exports.createReview = createOne(Review);

exports.getReviews = getAll(Review);

exports.getReview = getOne(Review);

// @desc    Update specific Review
// @route   PATCH /api/v1/reviews/:id
// @access  Private/Admin-Artisan

exports.updateReview = updateOne(Review);

// @desc    Delete specific Review
// @route   DELETE /api/v1/reviews/:id
// @access  Private/Admin

exports.deleteReview = deleteOne(Review);
