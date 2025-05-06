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
  console.log(`Starting order creation for session ${session.id}`);
  
  const cartId = session.client_reference_id;
  if (!cartId) {
    throw new Error('No cart ID found in session metadata');
  }
  
  // Parse shipping address from metadata
  let shippingAddress;
  try {
    shippingAddress = session.metadata && session.metadata.shippingAddress 
      ? JSON.parse(session.metadata.shippingAddress) 
      : {};
  } catch (error) {
    console.error("Error parsing shipping address:", error);
    shippingAddress = {};
  }
  
  const orderPrice = session.amount_total / 100;

  // Find the cart
  const cart = await Cart.findById(cartId);
  if (!cart) {
    throw new Error(`Cart not found with ID: ${cartId}`);
  }
  console.log(`Found cart with ${cart.cartItems.length} items`);

  // Find the user
  const user = await User.findOne({ email: session.customer_email });
  if (!user) {
    throw new Error(`User not found with email: ${session.customer_email}`);
  }
  console.log(`Found user: ${user._id} (${user.email})`);

  // 3) Create order with default paymentMethodType card
  console.log(`Creating order for user ${user._id}`);
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  console.log(`Order created with ID: ${order._id}`);

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    console.log(`Updating product quantities`);
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    
    await Product.bulkWrite(bulkOption, {});
    console.log(`Product quantities updated`);

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
    console.log(`Cart ${cartId} deleted`);
    
    return order;
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

  // Get frontend base URL from environment variables
  const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://127.0.0.1:5500";
  
  // Allow custom success and cancel URLs from frontend, or use default
  const backendUrl = `${req.protocol}://${req.get("host")}`;
  const successUrl = req.body.successUrl || `${backendUrl}/checkout-result`;
  const cancelUrl = req.body.cancelUrl || `${backendUrl}/checkout-result`;

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
    success_url: `${successUrl}?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${cancelUrl}?status=cancel`,
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

// New function to create Payment Intent
exports.createPaymentIntent = asyncHandler(async (req, res, nxt) => {
  // app settings (similar to checkoutSession)
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return nxt(
      new AppError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;
  const totalOrderPriceInSmallestUnit = Math.round(totalOrderPrice * 100);

  // TODO: Implement logic to retrieve or create Stripe customer ID if needed
  // const customer = await getOrCreateStripeCustomer(req.user);

  // 3) Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalOrderPriceInSmallestUnit,
    currency: "egp", // Use your actual currency
    // customer: customer.id, // Optional: Associate with Stripe customer
    metadata: {
      cartId: req.params.cartId,
      userId: req.user._id.toString(),
      // Add any other relevant metadata
    },
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter
    // is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // 4) Get Stripe Publishable Key from environment variables
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    console.error("Stripe Publishable Key not found in environment variables");
    // Decide if you want to throw an error or proceed without it
    // return nxt(new AppError('Internal server configuration error', 500));
  }

  // 5) Send publishable key and PaymentIntent client secret to client
  res.status(200).json({
    clientSecret: paymentIntent.client_secret,
    publishableKey: publishableKey, // Send key so frontend doesn't need to hardcode
  });
});

exports.webhookCheckout = asyncHandler(async (req, res, nxt) => {
  const sig = req.headers["stripe-signature"];
  console.log("Webhook received from Stripe");
  
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is missing in environment variables");
    return res.status(500).send("Webhook Error: Missing webhook secret");
  }

  if (!sig) {
    console.error("Missing Stripe signature in webhook request");
    return res.status(400).send("Webhook Error: No signature provided");
  }

  let event;
  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`✅ Webhook verified: ${event.type}`);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific event types
  if (event.type === "checkout.session.completed") {
    console.log(`💰 Processing checkout.session.completed event`);
    try {
      const session = event.data.object;
      // Log important session data for debugging
      console.log(`Session ID: ${session.id}`);
      console.log(`Customer Email: ${session.customer_email}`);
      console.log(`Cart ID: ${session.client_reference_id}`);
      
      await createCardOrder(session);
      console.log(`✅ Order created successfully for session ${session.id}`);
    } catch (error) {
      console.error(`❌ Error creating order:`, error);
      // Still return 200 to Stripe so they don't retry
      return res.status(200).json({ 
        received: true,
        error: error.message,
        success: false
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const cartId = paymentIntent.metadata?.cartId;
    const userId = paymentIntent.metadata?.userId;
    const failureReason = paymentIntent.last_payment_error?.message;

    console.log(
      `❌ Payment failed for cart ${cartId}, user ${userId}. Reason: ${failureReason}`
    );
  }

  // Return 200 success response to acknowledge receipt of the event
  console.log(`✅ Webhook handled successfully`);
  return res.status(200).json({ received: true, success: true });
});
