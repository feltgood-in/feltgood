require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const generateId = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

async function migrate() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    const categories = await Category.find();
    let catUpdates = 0;
    
    // Create a mapping of old subcategory string to new subcategory object
    // Map<categoryId, Map<oldString, newObj>>
    const catMigrations = new Map();

    for (const cat of categories) {
      if (cat.subcategories && cat.subcategories.length > 0) {
        let needsUpdate = false;
        const newSubcategories = [];
        const oldToNew = new Map();

        for (const sub of cat.subcategories) {
          if (typeof sub === 'string') {
            needsUpdate = true;
            const newObj = {
              id: generateId(sub),
              name: sub,
              nameSpanish: ''
            };
            newSubcategories.push(newObj);
            oldToNew.set(sub, newObj);
          } else {
            newSubcategories.push(sub);
          }
        }

        if (needsUpdate) {
          cat.subcategories = newSubcategories;
          await cat.save();
          catUpdates++;
          catMigrations.set(cat.id, oldToNew);
        }
      }
    }
    
    console.log(`Updated ${catUpdates} categories to use object subcategories.`);

    // Migrate products
    let prodUpdates = 0;
    const products = await Product.find();
    for (const prod of products) {
      if (prod.categoryId && catMigrations.has(prod.categoryId)) {
        const oldToNewMap = catMigrations.get(prod.categoryId);
        if (prod.subcategory && oldToNewMap.has(prod.subcategory)) {
          prod.subcategory = oldToNewMap.get(prod.subcategory).id;
          await prod.save();
          prodUpdates++;
        }
      }
    }

    console.log(`Updated ${prodUpdates} products to use subcategory IDs.`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
