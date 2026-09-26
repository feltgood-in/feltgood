require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Product = require('../models/Product');

async function distribute() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({});
  
  for (let p of products) {
    let cat = 'Home Decor';
    const id = p.id.toLowerCase();
    const name = p.name.toLowerCase();
    
    // Simple heuristic
    if (id.includes('tree') || id.includes('stocking') || id.includes('advent') || id.includes('christmas') || id.includes('festive') || name.includes('christmas') || name.includes('festive') || name.includes('star') || name.includes('pine')) {
      cat = 'Christmas';
    } else if (id.includes('flower') || id.includes('cactus') || id.includes('strawberry') || id.includes('wreath') || id.includes('mistletoe') || id.includes('garland') || name.includes('flower') || name.includes('cactus') || name.includes('berry') || name.includes('leaf') || name.includes('botanical')) {
      cat = 'Flower';
    } else if (id.includes('mediterranean') || name.includes('mediterranean') || id.includes('sea') || id.includes('sun') || name.includes('ocean')) {
      cat = 'Mediterranean';
    } else if (id.includes('gaudi') || name.includes('gaudi') || id.includes('abstract') || name.includes('mosaic')) {
      cat = 'Gaudi';
    } else {
      cat = 'Home Decor'; // fallback
    }

    p.categoryId = cat;
    await p.save();
  }
  
  console.log("Products distributed.");
  process.exit(0);
}

distribute();
