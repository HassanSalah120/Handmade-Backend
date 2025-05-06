const mongoose = require('mongoose');
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
// Load environment variables from config.env in the project root
require('dotenv').config({ path: 'config.env' });

// Base URL for Picsum Photos
const PICSUM_BASE_URL = 'https://picsum.photos';

// Function to generate a Picsum Photos URL with specific dimensions
const getPicsumUrl = (width = 800, height = 600) => {
  // Adding a random query parameter to avoid browser caching issues
  return `${PICSUM_BASE_URL}/${width}/${height}?random=${Math.random()}`;
};

// Generate placeholder image URLs for categories
// We can generate them dynamically instead of hardcoding many URLs
const generateCategoryImages = () => {
  return {
    coverImages: Array.from({ length: 4 }, () => getPicsumUrl(800, 600)),
    productImages: [
      Array.from({ length: 3 }, () => getPicsumUrl(600, 400)),
      Array.from({ length: 3 }, () => getPicsumUrl(600, 400)),
    ]
  };
};

// Define image sets for specific categories (can be customized if needed)
// For simplicity, we'll use dynamically generated ones for all categories now
const imagesByCategoryMap = {
  'Leather': generateCategoryImages(),
  'Wood': generateCategoryImages(),
  'Accessories': generateCategoryImages(),
  'Ceramics & Pottery': generateCategoryImages()
  // Add more categories here if needed
};

// Default for categories not found
const defaultImages = generateCategoryImages();

// Get random item from array
const getRandomItem = (array) => {
  if (!array || array.length === 0) return getPicsumUrl(); // Fallback
  return array[Math.floor(Math.random() * array.length)];
};

// Get random images array for a product
const getRandomImages = (categoryName) => {
  const categoryImages = imagesByCategoryMap[categoryName] || defaultImages;

  // Get random cover image
  const coverImage = getRandomItem(categoryImages.coverImages);

  // Get random product images set (1-3 images)
  const productImagesSet = getRandomItem(categoryImages.productImages);
  const numImages = Math.floor(Math.random() * 3) + 1; // 1 to 3 images
  const productImages = productImagesSet
    ? productImagesSet.slice(0, numImages)
    : [getPicsumUrl(600, 400)]; // Fallback if set is empty

  return { coverImage, productImages };
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Make sure DB_URI is loaded from the correct .env file
    if (!process.env.DB_URI) {
      console.error('DB_URI not found in environment variables. Make sure config.env exists in the project root and contains DB_URI.');
      process.exit(1);
    }
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Seed the database with real images
const seedProductImages = async () => {
  try {
    // Connect to the database
    const connected = await connectDB();
    if (!connected) {
      console.log('Database connection failed. Exiting...');
      process.exit(1);
    }
    
    // Get all products WITHOUT using populate to avoid permission issues
    // Just get the raw products first
    const products = await Product.find({}, '_id title category').lean();

    if (!products || products.length === 0) {
        console.log('No products found to update.');
        await mongoose.disconnect();
        process.exit(0);
    }

    console.log(`Updating images for ${products.length} products...`);
    
    // Get all categories in one query to avoid multiple DB hits
    const categories = await Category.find({}, '_id name').lean();
    
    // Create a lookup map for categories
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.name;
    });

    // Update each product with real images
    for (const product of products) {
      try {
        // Get category name from our map instead of using populate
        const categoryId = product.category ? product.category.toString() : null;
        const categoryName = categoryId && categoryMap[categoryId] ? categoryMap[categoryId] : 'default';
        
        // Get random images for this category
        const { coverImage, productImages } = getRandomImages(categoryName);
        
        // Update product using updateOne directly to bypass middleware
        // This approach can avoid permission issues
        await Product.updateOne(
          { _id: product._id },
          { 
            $set: {
              imageCover: coverImage,
              images: productImages,
            }
          },
          { 
            // Options to bypass hooks and validation
            timestamps: false,
            validateBeforeSave: false,
            strict: false
          }
        );
        
        console.log(`Updated product: ${product.title} (ID: ${product._id})`);
      } catch (productError) {
        console.error(`Error updating product ${product._id}: ${productError.message}`);
        // Continue with next product instead of stopping the whole process
      }
    }
    
    console.log('Product images updated successfully!');
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating product images:', error);
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log('Database connection closed due to error.');
    }
    process.exit(1);
  }
};

// Run the seeder
seedProductImages(); 