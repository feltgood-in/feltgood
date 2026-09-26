require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function seedProducts() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const christmasCat = await Category.findOne({ id: { $regex: /^christmas$/i } });
    if (!christmasCat) {
      console.log("Christmas category not found!");
      process.exit(1);
    }
    
    if (!christmasCat.subcategories || christmasCat.subcategories.length === 0) {
      console.log("No subcategories found in Christmas category.");
      process.exit(1);
    }
    
    const newProducts = [];
    
    for (const subcat of christmasCat.subcategories) {
      for (let i = 1; i <= 10; i++) {
        newProducts.push(new Product({
          id: `new-${subcat.id}-item-${i}-${Date.now()}`,
          name: `${subcat.name} Item ${i}`,
          description: `This is a beautifully handcrafted ${subcat.name} perfect for the holiday season. Made entirely from natural wool felt.`,
          price: 15 + Math.floor(Math.random() * 40),
          categoryId: christmasCat.id,
          subcategory: subcat.id,
          pricing: {
            base: 15,
            tier5k: 12,
            tier10k: 10
          }
        }));
      }
    }
    
    await Product.insertMany(newProducts);
    console.log(`Inserted ${newProducts.length} new products across ${christmasCat.subcategories.length} subcategories.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedProducts();
