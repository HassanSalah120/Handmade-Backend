const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const {
  getDashboardStatistics,
  getCategoriesDistribution,
  getTopSellingProducts,
  getRecentOrders,
  getCategoriesWithSubcategories,
  getRevenueTimeline
} = require("../controller/adminController");

const router = express.Router();

// Protect all routes - only admins can access
router.use(protect, restrictTo("admin"));

// Dashboard statistics
router.get("/statistics", getDashboardStatistics);

// Categories distribution
router.get("/categories/distribution", getCategoriesDistribution);

// Categories with subcategories
router.get("/categories/with-subcategories", getCategoriesWithSubcategories);

// Top selling products
router.get("/products/top-selling", getTopSellingProducts);

// Recent orders
router.get("/orders/recent", getRecentOrders);

// Revenue timeline
router.get("/revenue/timeline", getRevenueTimeline);

module.exports = router; 