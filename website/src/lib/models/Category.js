import mongoose from 'mongoose';

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

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
