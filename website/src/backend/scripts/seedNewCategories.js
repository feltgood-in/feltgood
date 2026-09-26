require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const newCategories = [
  { id: 'Christmas', title: 'Christmas Collection', subtitle: 'Festive items for the holiday season.' },
  { id: 'Mediterranean', title: 'Mediterranean Collection', subtitle: 'Inspired by the sea and sun.' },
  { id: 'Gaudi', title: 'Gaudi Collection', subtitle: 'Abstract and architectural designs.' },
  { id: 'Flower', title: 'Flower Collection', subtitle: 'Floral and botanical patterns.' },
  { id: 'Home Decor', title: 'Home Decor', subtitle: 'Everyday items to brighten your space.' }
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    // 1. Delete old categories and insert new ones
    await Category.deleteMany({});
    await Category.insertMany(newCategories);
    console.log("Inserted 5 new categories.");

    // 2. Assign all existing products to 'Home Decor' if they don't match one of the new IDs
    const products = await Product.find({});
    let updatedCount = 0;
    
    for (let product of products) {
      if (!newCategories.find(c => c.id === product.categoryId)) {
        product.categoryId = 'Home Decor';
        await product.save();
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} products to 'Home Decor' category.`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
