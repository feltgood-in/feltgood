const mongoose = require('mongoose');

const HomepageSchema = new mongoose.Schema({
  heroBanners: [{
    id: String,
    image: String,
    title: String,
    subtitle: String,
    link: String
  }],
  promoCards: [{
    id: String,
    image: String,
    filter: String
  }],
  categoryFeaturedItems: {
    type: Map,
    of: [String]
  },
  categoryTitles: {
    type: Map,
    of: String
  }
}, { strict: false });

module.exports = mongoose.model('Homepage', HomepageSchema);
