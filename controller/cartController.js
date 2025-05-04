const Cart = require("../models/cartModel");
const Coupon = require("../models/couponMode");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");

const calcTotalPriceCart = (cart) => {
  let totalPrice = 0;

  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

exports.addProductToCart = asyncHandler(async (req, res, nxt) => {
  const { productId, color } = req.body;

  const product = await Product.findById(productId);

  if (product.quantity == 0) {
    return nxt(new AppError(`Product is out of stock`, 400));
  }

  //Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user.id });

  // if not exist, create new Cart
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      cartItems: [
        {
          product: productId,
          color,
          price: product.price,
          imageCover: product.imageCover,
        },
      ],
    });
  } else {
    isExist = (item) =>
      item.product.toString() === productId && item.color == color;
    const productIdx = cart.cartItems.findIndex(isExist);

    if (productIdx > -1) {
      const cartItem = cart.cartItems[productIdx];
      cartItem.quantity += 1;
      cart.cartItems[productIdx] = cartItem;
    } else {
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
        imageCover: product.imageCover,
      });
    }
  }
  calcTotalPriceCart(cart);
  await cart.save();

  res.status(200).json({
    status: "Success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.getLoggedUserCart = asyncHandler(async (req, res, nxt) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return nxt(
      new AppError(`There is no cart for this user id : ${req.user.id}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.removeItemFromCart = asyncHandler(async (req, res, nxt) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calcTotalPriceCart(cart);
  cart.save();

  res.status(200).json({
    status: "Success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.clearCart = asyncHandler(async (req, res, nxt) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).send();
});

exports.updateCartItemQuantity = asyncHandler(async (req, res, nxt) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return nxt(new AppError(`There is no cart for user ${req.user.id}`, 404));
  }

  const isExist = (item) => item._id.toString() === req.params.itemId;
  const itemIdx = cart.cartItems.findIndex(isExist);

  if (itemIdx > -1) {
    const cartItem = cart.cartItems[itemIdx];
    cartItem.quantity = quantity;
    cart.cartItems[itemIdx] = cartItem;
  } else {
    return nxt(
      new AppError(`There is no item for this id : ${req.params.itemId}`)
    );
  }

  calcTotalPriceCart(cart);

  await cart.save();

  res.status(200).json({
    status: "Success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.applyCoupon = asyncHandler(async (req, res, nxt) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.name,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return nxt(new AppError(`Coupon is invalid or expired`));
  }
  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user.id });

  const totalPrice = cart.totalCartPrice;
  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDisc = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalCartPrice = totalPriceAfterDisc;
  await cart.save();

  res.status(200).json({
    status: "Success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
