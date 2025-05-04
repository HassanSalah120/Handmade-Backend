const User = require("../models/userModel");
const sharp = require("sharp");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/AppError");
const { uploadSingleImage } = require("../middlewares/uploadImageMW");

const {
  deleteOne,
  getAll,
  getOne,
  updateOne,
  createOne,
} = require("./handlersFactory");

exports.uploadUserPhoto = uploadSingleImage("profile_picture");

exports.resizeUserPhoto = asyncHandler(async (req, res, nxt) => {
  if (!req.file) return nxt();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  req.body.profile_picture = req.file.filename;

  nxt();
});

exports.getMe = (req, res, nxt) => {
  req.params.id = req.user.id;
  nxt();
};

exports.getUsers = getAll(User);

exports.createUser = createOne(User);

exports.getUser = getOne(User);

// @desc    Update specific User
// @route   PATCH /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = updateOne(User);

// @desc    Delete specific User
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = deleteOne(User);

exports.updateMe = asyncHandler(async (req, res, nxt) => {
  if (req.body.password || req.body.passwordConfirm) {
    return nxt(
      new ApiError(
        "This route is not for password updates. please use /updatePassword",
        400
      )
    );
  }

  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
  });

  if (!user) {
    return nxt(new ApiError(`No User for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: user });
});
