require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const translations = {
  "Gaudi Collection": "Colección Gaudí",
  "Christmas Collection": "Colección de Navidad",
  "Mediterranean Collection": "Colección Mediterránea",
  "Flower Collection": "Colección Floral",
  "Home Decor": "Decoración del Hogar",
  "All": "Todo",
  "Test TAB": "Test TAB"
};

function translate(text) {
  if (!text) return "";
  for (const [eng, span] of Object.entries(translations)) {
    if (text.trim().toLowerCase() === eng.toLowerCase()) {
      return span;
    }
  }
  return text;
}

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to DB, translating categories...");
  const categories = await Category.find({});
  let count = 0;
  for (let c of categories) {
    const spanish = translate(c.title);
    await Category.updateOne({ _id: c._id }, { $set: { titleSpanish: spanish } });
    count++;
    console.log(`Translated: ${c.title} -> ${spanish}`);
  }
  console.log(`Successfully translated ${count} categories.`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
