const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: String,
  titleSpanish: String,
  subtitle: String,
  subcategories: [{
    id: String,
    name: String,
    nameSpanish: String
  }],
  products: [{
    id: String,
    name: String,
    image: String,
    color: String,
    price: Number
  }]
}, { strict: false });

module.exports = mongoose.model('Category', CategorySchema);
