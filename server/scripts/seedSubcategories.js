require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const subcategories = [
  'Christmas Trees',
  'Christmas Advent Calendar',
  'Christmas Ornaments',
  'Christmas Stockings',
  'Christmas Garlands'
];

async function seed() {
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
    
    christmasCat.subcategories = subcategories;
    await christmasCat.save();
    console.log("Updated Christmas category subcategories.");

    const products = await Product.find({ categoryId: christmasCat.id });
    for (let i = 0; i < products.length; i++) {
      products[i].subcategory = subcategories[i % subcategories.length];
      await products[i].save();
    }
    console.log(`Updated ${products.length} products with a subcategory.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
