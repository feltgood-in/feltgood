const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true },
  categoryId: String,
  subcategory: String,
  itemNumber: String,
  name: String,
  image: String,
  color: String,
  price: Number,
  subtitle: String,
  description: String,
  specs: [String],
  specsSpanish: [String],
  images: [String],
  colors: [String],
  nameSpanish: String,
  subtitleSpanish: String,
  badgeTextSpanish: String,
  descriptionSpanish: String,
  pricing: {
    base: Number,
    tier5k: Number,
    tier10k: Number
  }
}, { strict: false });

module.exports = mongoose.model('Product', ProductSchema);
