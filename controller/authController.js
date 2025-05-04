const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const welcomeEmailHtml = require("../utils/templates/welcomeEmail");

const signToken = (id) => {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createCookie = (token, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV == "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
};

exports.signUp = asyncHandler(async (req, res, nxt) => {
  const newUser = await User.create(req.body);
  const token = signToken(newUser._id);
  newUser.password = undefined;

  const msg = `Welcome to HandMade, ${newUser.name}!\n\nWe're excited to have you join our marketplace.\n\nExplore handmade crafts, support local artists, and enjoy a world of creativity.\n\nVisit us: https://yourhandmadeapp.com\n\nCheers,\nThe HandMade Team`;

  await sendEmail({
    email: newUser.email,
    subject: "Welcome to HandMade!",
    message: msg,
    html: welcomeEmailHtml(newUser.name),
  });

  res.status(201).json({
    status: "Success",
    token,
    data: newUser,
  });

  // createSendToken(newUser, 201, res);
});

exports.login = asyncHandler(async (req, res, nxt) => {
  //check user is exist and password is correct

  const { email, password } = req.body;
  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password))) {
    return nxt(new AppError(`Incorrect email or password..!!`, 401));
  }

  //If everything is OK, send response to client
  // createSendToken(user, 200, res);
  const token = signToken(user._id);

  createCookie(token, res);

  res.status(200).json({
    status: "Success",
    token,
  });
});

exports.protect = asyncHandler(async (req, res, nxt) => {
  // 1- Getting token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return nxt(
      new AppError(
        `You are not logged in..!! Please Log In to get access.`,
        401
      )
    );
  }

  // 2- verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3- check if user is still exist
  const currentUser = await User.findById(decoded.userId);

  if (!currentUser) {
    return nxt(
      new AppError(
        `The user belonging to this token does no longer exist .`,
        401
      )
    );
  }

  // 4- check user changed password after token issued

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return nxt(
      new AppError(
        `User recently changed password..!! Please Log in again.`,
        401
      )
    );
  }

  req.user = currentUser;

  nxt();
});

exports.restrictTo = (...roles) => {
  return (req, res, nxt) => {
    if (!roles.includes(req.user.role)) {
      return nxt(
        new AppError(
          `You don't have Permission to perform this action..!!`,
          403
        )
      );
    }
    nxt();
  };
};

exports.forgotPassword = asyncHandler(async (req, res, nxt) => {
  //  Get user based on POSTed email
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return nxt(new AppError(`There is no user with email address`, 404));
  }

  //  Generate the random reset token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //  send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot Your Password...? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't forget your password, Please ignore this email.!!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "Success",
      message: `Token sent to email!`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return nxt(
      new AppError(`There is an error sending the email. Try again later!`, 500)
    );
  }
});

exports.resetPassword = asyncHandler(async (req, res, nxt) => {
  // Get user based on resetToken
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return nxt(new AppError("Token is invalid or is Expired..!!", 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  const token = signToken(user._id);

  createCookie(token, res);

  res.status(200).json({
    status: "Success",
    token,
  });
});

exports.updatePassword = asyncHandler(async (req, res, nxt) => {
  // Get user from Collection\
  const user = await User.findById(req.params.id).select("+password");

  // check user password is correct
  if (!(await user.checkPassword(req.body.currentPassword, user.password))) {
    return nxt(new AppError("You current password is Wrong..!!", 401));
  }

  //update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Log user in , send JWT
  const token = signToken(user._id);

  createCookie(token, res);

  res.status(200).json({
    status: "Success",
    token,
  });
});

exports.deleteMe = asyncHandler(async (req, res, nxt) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).send();
});
