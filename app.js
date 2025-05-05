const express = require("express");
require("dotenv").config({ path: "./config.env" });
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const errorHandler = require("./middlewares/errorHandling");
const categoryRouter = require("./routes/Category");
const subCategoryRouter = require("./routes/SubCategory");
const userRouter = require("./routes/User");
const productRouter = require("./routes/Product");
const reviewRouter = require("./routes/Review");
const wishListRouter = require("./routes/Wishlist");
const addressRouter = require("./routes/Address");
const couponRouter = require("./routes/Coupon");
const cartRouter = require("./routes/Cart");
const orderRouter = require("./routes/Order");
const adminRouter = require("./routes/Admin");
const { webhookCheckout } = require("./controller/orderController");
const AppError = require("./utils/AppError");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const cors = require("cors");

const app = express();


app.use(cors());
app.options("*", cors());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// compress all responses
app.use(compression());

// IMPORTANT: Place Stripe webhook handler before any body-parsers
// This must use express.raw() to get the raw request body for Stripe signature verification
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);

// Regular body parsing middleware - must come AFTER webhook route
app.use(express.json({ limit: "10Kb" }));

//middlewares
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, Please try again in an hour..!!",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10Kb" }));

// Data Sanitization against NoSQL Query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

app.use(
  hpp({
    whitelist: [
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
      "weight",
      "price",
      "sold",
    ],
  })
);

//routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Add checkout result route with redirect to frontend
app.get("/checkout-result", async (req, res) => {
  try {
    const status = req.query.status;
    const sessionId = req.query.session_id;
    
    // Get frontend base URL from environment variables
    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || "http://127.0.0.1:5500";
    
    if (status === 'success' && sessionId) {
      // 1. Use Stripe to get the session
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['payment_intent']
      });
      
      // 2. Find the order using user email or payment intent metadata
      const Order = require("./models/orderModel");
      const User = require("./models/userModel");
      
      // First check if there's a recent order for this email
      const user = await User.findOne({ email: session.customer_email });
      
      if (!user) {
        // If user not found, redirect to products page
        return res.redirect(`${frontendBaseUrl}/pages/products.html`);
      }
      
      // Find most recent order for this user (assuming it's the one we just created via webhook)
      const order = await Order.findOne({ user: user._id }).sort('-createdAt');
        
      if (order) {
        // Redirect to frontend success page with order ID
        return res.redirect(`${frontendBaseUrl}/pages/order-success.html?orderId=${order._id}`);
      } else {
        // Order might still be processing, redirect to processing page
        return res.redirect(`${frontendBaseUrl}/pages/order-processing.html?session=${sessionId}`);
      }
    } else if (status === 'cancel') {
      // Redirect to cart page on cancellation
      return res.redirect(`${frontendBaseUrl}/pages/cart.html`);
    } else {
      // Redirect to home page for unknown status
      return res.redirect(`${frontendBaseUrl}/index.html`);
    }
  } catch (error) {
    console.error("Checkout result error:", error);
    // Redirect to error page on exception
    return res.redirect(`${frontendBaseUrl}/pages/error.html?message=${encodeURIComponent("Payment processing error")}`);
  }
});

app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/subCategories", subCategoryRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/wishLists", wishListRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/carts", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/admin", adminRouter);

app.all("*", (req, res, nxt) => {
  nxt(
    new AppError(`can't find this route ${req.originalUrl} on this server`, 404)
  );
});

app.use(errorHandler);

module.exports = app;
