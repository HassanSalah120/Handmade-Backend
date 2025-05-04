const asyncHandler = require("express-async-handler");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { getAll } = require("./handlersFactory");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCashOrder = asyncHandler(async (req, res, nxt) => {
  let taxPrice = 0,
    shippingPrice = 0;

  const cart = await Cart.findById(req.params.cartId);

  if (!cart) {
    return nxt(
      new AppError(
        `There is no such cart with this id :${req.params.cartId}`,
        404
      )
    );
  }

  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // Check if there's enough stock for all items in the cart
  for (const item of cart.cartItems) {
    const product = await Product.findById(item.product);

    if (!product) {
      return nxt(new AppError(`Product not found: ${item.product}`, 404));
    }

    if (product.quantity < item.quantity) {
      return nxt(
        new AppError(
          `Insufficient stock for product ${product.title || product._id}`,
          400
        )
      );
    }
  }

  const order = await Order.create({
    user: req.user.id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOption, {});

    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({
    status: "Success",
    data: order,
  });
});

exports.findAllOrders = getAll(Order);

// exports.getOrder = getOne(Order);

exports.updateOrderToPaid = asyncHandler(async (req, res, nxt) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return nxt(
      new AppError(`There is no such Order with this id: ${req.params.id}`, 404)
    );
  }
  order.isPaid = true;
  order.PaidAt = Date.now();
  const updatedOrder = await order.save();

  res.status(200).json({
    status: "Success",
    data: updatedOrder,
  });
});

// @desc    Update order delivered status
// @route   PUT /api/v1/orders/:id/deliver
// @access  Protected/Admin-Manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, nxt) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return nxt(
      new AppError(`There is no such Order with this id: ${req.params.id}`, 404)
    );
  }
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();

  res.status(200).json({
    status: "Success",
    data: updatedOrder,
  });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = { user: req.user._id };
  next();
});

exports.getUserOrders = asyncHandler(async (req, res, nxt) => {
  const orders = await Order.find({ user: req.params.userId }).populate(
    "cartItems.product"
  );

  if (orders.length <= 0) {
    return nxt(
      new AppError(`There are no orders for this id: ${req.params.userId}`, 404)
    );
  }

  res.status(200).json({
    status: "Success",
    count: orders.length,
    data: orders,
  });
});

const createCardOrder = asyncHandler(async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
});

exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new AppError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: Math.round(totalOrderPrice * 100), // Convert price to smallest currency unit (EGP paisa or cents)
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/api/v1/products`,
    cancel_url: `${req.protocol}://${req.get("host")}/api/v1/carts`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: {
      shippingAddress: JSON.stringify(req.body.shippingAddress),
    },
    payment_method_types: ["card"],
    payment_intent_data: {
      metadata: {
        cartId: req.params.cartId,
        userId: req.user._id.toString(),
      },
    },
  });

  // 4) send session to response
  res.status(200).json({
    status: "success",
    session,
  });
});

exports.webhookCheckout = asyncHandler(async (req, res, nxt) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    // console.log(event);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    //  Create order
    createCardOrder(event.data.object);
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const cartId = paymentIntent.metadata?.cartId;
    const userId = paymentIntent.metadata?.userId;
    const failureReason = paymentIntent.last_payment_error?.message;

    console.log(
      `❌ Payment failed for cart ${cartId}. Reason: ${failureReason}`
    );

    // await Cart.findByIdAndUpdate(cartId, { status: 'failed', failureReason });
  }

  res.status(200).json({ received: true });
});
