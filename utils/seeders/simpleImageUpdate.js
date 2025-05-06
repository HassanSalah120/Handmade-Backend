const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Base URL for Picsum Photos
const PICSUM_BASE_URL = 'https://picsum.photos';

// Function to generate a Picsum Photos URL with specific dimensions
const getPicsumUrl = (width = 800, height = 600, id = Math.floor(Math.random() * 1000)) => {
  return `${PICSUM_BASE_URL}/id/${id}/${width}/${height}`;
};

// Get images for a product
const getImagesForProduct = (category) => {
  // Generate a cover image
  const coverImage = getPicsumUrl(800, 600);
  
  // Generate 1-3 product images
  const numImages = Math.floor(Math.random() * 3) + 1;
  const productImages = [];
  
  for (let i = 0; i < numImages; i++) {
    productImages.push(getPicsumUrl(600, 400));
  }
  
  return { coverImage, productImages };
};

// Update API endpoint (change as needed)
const API_URL = 'http://localhost:8000/api/v1/products';

// Function to read and save updated product data
const updateProductImages = async () => {
  try {
    console.log('Starting product image update...');
    
    // Update all products via API
    const response = await axios.get(`${API_URL}/all`);
    
    if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
      console.error('Invalid API response format');
      return;
    }
    
    const products = response.data.data;
    console.log(`Found ${products.length} products to update`);
    
    // Track updated products
    const updatedProducts = [];
    
    // Update each product with new images
    for (const product of products) {
      try {
        const { coverImage, productImages } = getImagesForProduct(
          product.category?.name || 'default'
        );
        
        // Create an updated product with new images
        const updatedProduct = {
          ...product,
          imageCover: coverImage,
          images: productImages
        };
        
        // Keep track of updated products
        updatedProducts.push(updatedProduct);
        
        console.log(`Updated product: ${product.title} (ID: ${product._id})`);
      } catch (err) {
        console.error(`Error updating product ${product._id}: ${err.message}`);
      }
    }
    
    // Save the updated products to a file for reference
    fs.writeFileSync(
      path.join(__dirname, 'updated_products.json'), 
      JSON.stringify({ data: updatedProducts }, null, 2)
    );
    
    console.log('Product updates saved to updated_products.json');
    console.log('To apply these updates, you can use the JSON file as a reference to manually update products or implement the API update feature');
    
  } catch (error) {
    console.error('Error in the update process:', error.message);
  }
};

// Run the update function
updateProductImages(); 