const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

exports.addAddress = asyncHandler(async (req, res, nxt) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $addToSet: { addresses: req.body },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: "Success",
    message: "Address added successfully.",
    data: user.addresses,
  });
});

exports.removeAddress = asyncHandler(async (req, res, nxt) => {

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: {
        addresses: { _id: req.params.addressId },
      },
    },
    { new: true }
  );

  

  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    data: user.addresses,
  });
});

exports.getLoggedUserAddresses = asyncHandler(async (req, res, nxt) => {
  const user = await User.findById(req.user.id).populate("addresses");

  res.status(200).json({
    status: "Success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
