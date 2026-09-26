require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Category = require('../models/Category');
const Product = require('../models/Product');
const Homepage = require('../models/Homepage');

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    // Migrate Products & Categories
    const dbPath = path.join(__dirname, '../data', 'db.json');
    if (fs.existsSync(dbPath)) {
      console.log("Migrating db.json...");
      const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      
      await Category.deleteMany({});
      if (dbData.categories && dbData.categories.length > 0) {
        await Category.insertMany(dbData.categories);
        console.log(`Inserted ${dbData.categories.length} categories.`);
      }

      await Product.deleteMany({});
      if (dbData.products && dbData.products.length > 0) {
        await Product.insertMany(dbData.products);
        console.log(`Inserted ${dbData.products.length} products.`);
      }
    } else {
      console.log("db.json not found, skipping...");
    }

    // Migrate Homepage
    const homepagePath = path.join(__dirname, '../data', 'homepage.json');
    if (fs.existsSync(homepagePath)) {
      console.log("Migrating homepage.json...");
      const homepageData = JSON.parse(fs.readFileSync(homepagePath, 'utf8'));
      
      await Homepage.deleteMany({});
      await Homepage.create(homepageData);
      console.log("Inserted homepage data.");
    } else {
      console.log("homepage.json not found, skipping...");
    }

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
