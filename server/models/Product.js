const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true },
  categoryId: String,
  itemNumber: String,
  name: String,
  image: String,
  color: String,
  price: Number,
  subtitle: String,
  description: String,
  specs: [String],
  images: [String],
  colors: [String],
  pricing: {
    base: Number,
    tier5k: Number,
    tier10k: Number
  }
}, { strict: false });

module.exports = mongoose.model('Product', ProductSchema);
