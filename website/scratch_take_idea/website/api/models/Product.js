const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true },
  itemNumber: String,
  name: String,
  image: String,
  color: String,
  price: Number,
  oldPrice: Number,
  subtitle: String,
  badgeText: String,
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
