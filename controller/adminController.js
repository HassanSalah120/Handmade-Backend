const asyncHandler = require("express-async-handler");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const SubCategory = require("../models/subCategoryModel");

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/statistics
 * @access  Private/Admin
 */
exports.getDashboardStatistics = asyncHandler(async (req, res) => {
  // 1. Orders statistics
  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ isDelivered: false });
  const completedOrders = await Order.countDocuments({ isDelivered: true });
  
  // 2. Revenue statistics
  const revenue = await Order.aggregate([
    {
      $match: { isPaid: true }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalOrderPrice" },
        avgOrderValue: { $avg: "$totalOrderPrice" }
      }
    }
  ]);
  
  // 3. User statistics
  const totalUsers = await User.countDocuments();
  const customers = await User.countDocuments({ role: "user" });
  const artisans = await User.countDocuments({ role: "artisan" });
  const admins = await User.countDocuments({ role: "admin" });
  
  // 4. Products statistics
  const totalProducts = await Product.countDocuments();
  
  // 5. Monthly revenue for current year
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalOrderPrice" },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Format monthly revenue for easier frontend consumption
  const monthlyRevenueFormatted = Array.from({ length: 12 }, (_, i) => {
    const found = monthlyRevenue.find(item => item._id === i + 1);
    return {
      month: i + 1,
      revenue: found ? found.revenue : 0,
      count: found ? found.count : 0
    };
  });
  
  res.status(200).json({
    status: "success",
    data: {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders
      },
      revenue: {
        total: revenue.length > 0 ? revenue[0].totalRevenue : 0,
        avgOrderValue: revenue.length > 0 ? revenue[0].avgOrderValue : 0
      },
      users: {
        total: totalUsers,
        customers,
        artisans,
        admins
      },
      products: {
        total: totalProducts
      },
      monthlyRevenue: monthlyRevenueFormatted
    }
  });
});

/**
 * @desc    Get categories distribution
 * @route   GET /api/v1/admin/categories/distribution
 * @access  Private/Admin
 */
exports.getCategoriesDistribution = asyncHandler(async (req, res) => {
  const categoriesWithProductCount = await Category.aggregate([
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "category",
        as: "products"
      }
    },
    {
      $project: {
        name: 1,
        productCount: { $size: "$products" }
      }
    },
    { $sort: { productCount: -1 } }
  ]);
  
  // Calculate total products for percentage
  const totalProducts = categoriesWithProductCount.reduce(
    (sum, category) => sum + category.productCount, 0
  );
  
  // Add percentage to each category
  const categoriesWithPercentage = categoriesWithProductCount.map(category => ({
    _id: category._id,
    name: category.name,
    productCount: category.productCount,
    percentage: totalProducts ? ((category.productCount / totalProducts) * 100).toFixed(2) : 0
  }));
  
  res.status(200).json({
    status: "success",
    data: {
      categories: categoriesWithPercentage,
      totalProducts
    }
  });
});

/**
 * @desc    Get top selling products
 * @route   GET /api/v1/admin/products/top-selling
 * @access  Private/Admin
 */
exports.getTopSellingProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const topProducts = await Product.find()
    .sort({ sold: -1 })
    .limit(limit)
    .select("title price sold quantity imageCover ratingsAverage");
  
  res.status(200).json({
    status: "success",
    results: topProducts.length,
    data: topProducts
  });
});

/**
 * @desc    Get recent orders
 * @route   GET /api/v1/admin/orders/recent
 * @access  Private/Admin
 */
exports.getRecentOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate({ path: "user", select: "name email" });
  
  res.status(200).json({
    status: "success",
    results: recentOrders.length,
    data: recentOrders
  });
});

/**
 * @desc    Get categories with subcategories
 * @route   GET /api/v1/admin/categories/with-subcategories
 * @access  Private/Admin
 */
exports.getCategoriesWithSubcategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().select("name");
  
  const categoriesWithSubcatCounts = await Promise.all(
    categories.map(async (category) => {
      const subcategoryCount = await SubCategory.countDocuments({ category: category._id });
      return {
        _id: category._id,
        name: category.name,
        subcategoryCount
      };
    })
  );
  
  res.status(200).json({
    status: "success",
    data: categoriesWithSubcatCounts
  });
});

/**
 * @desc    Get revenue timeline data
 * @route   GET /api/v1/admin/revenue/timeline
 * @access  Private/Admin
 */
exports.getRevenueTimeline = asyncHandler(async (req, res) => {
  const period = req.query.period || 'monthly';
  let timeline;
  
  if (period === 'daily') {
    // Get daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    timeline = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalOrderPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  } else if (period === 'weekly') {
    // Get weekly revenue for the last 12 weeks
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks * 7 days
    
    timeline = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: twelveWeeksAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" }
          },
          revenue: { $sum: "$totalOrderPrice" },
          orders: { $sum: 1 },
          firstDay: { $min: "$createdAt" }
        }
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
      {
        $project: {
          _id: 0,
          period: { $concat: ["W", { $toString: "$_id.week" }, "-", { $toString: "$_id.year" }] },
          revenue: 1,
          orders: 1,
          firstDay: 1
        }
      }
    ]);
  } else {
    // Get monthly revenue for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    timeline = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$totalOrderPrice" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          period: { 
            $concat: [
              { $switch: {
                branches: [
                  { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id.month", 5] }, then: "May" },
                  { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id.month", 12] }, then: "Dec" }
                ],
                default: ""
              }},
              " ",
              { $toString: "$_id.year" }
            ]
          },
          revenue: 1,
          orders: 1
        }
      }
    ]);
  }
  
  res.status(200).json({
    status: "success",
    data: {
      period,
      timeline
    }
  });
}); 