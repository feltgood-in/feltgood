require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

const collections = [
  { id: 'Christmas', name: 'Christmas Collection', prefix: 'XMAS' },
  { id: 'Mediterranean', name: 'Mediterranean Collection', prefix: 'MED' },
  { id: 'Gaudi', name: 'Gaudi Collection', prefix: 'GAUDI' },
  { id: 'Flower', name: 'Flower Collection', prefix: 'FLR' },
  { id: 'Home Decor', name: 'Home Decor', prefix: 'HOME' }
];

const sampleImages = [
  'cld-sample', 'cld-sample-2', 'cld-sample-3', 'cld-sample-4'
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB Atlas");

    // Clear existing products to avoid duplicates and confusion
    await Product.deleteMany({});
    console.log("Cleared old products.");

    for (const col of collections) {
      let categoryDoc = await Category.findOne({ id: col.id });
      if (!categoryDoc) {
        console.log(`Category ${col.id} not found, skipping...`);
        continue;
      }

      // Generate 10 products for this category
      const productsToInsert = [];
      const nestedProducts = [];

      for (let i = 1; i <= 10; i++) {
        const prodId = `${col.prefix.toLowerCase()}-item-${i}`;
        const prodName = `${col.name} Item ${i}`;
        const price = Math.floor(Math.random() * 10) + 5; // $5 to $14
        const img = sampleImages[i % sampleImages.length];

        const p = {
          id: prodId,
          categoryId: col.id,
          itemNumber: `${col.prefix}-${String(i).padStart(3, '0')}`,
          name: prodName,
          image: img,
          images: [img, img],
          color: 'bg-sand',
          price: price,
          subtitle: `Beautiful handmade item for the ${col.name}`,
          description: `This is a premium ${prodName}. Crafted with care and perfect for your collection.`,
          specs: ["100% Wool Felt", "Hand-stitched details", "Eco-friendly dyes"],
          colors: ["bg-sand", "bg-sage"],
          pricing: {
            base: price,
            tier5k: price * 0.85,
            tier10k: price * 0.75
          }
        };

        productsToInsert.push(p);
        
        // Push simplified version to Category's nested array just in case it's needed
        nestedProducts.push({
          id: p.id,
          name: p.name,
          image: p.image,
          color: p.color,
          price: p.price
        });
      }

      // Insert into Product collection
      await Product.insertMany(productsToInsert);
      
      // Update Category collection
      categoryDoc.products = nestedProducts;
      await categoryDoc.save();

      console.log(`Created 10 items for ${col.id}`);
    }

    console.log("Database seeded successfully with 50 products!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
