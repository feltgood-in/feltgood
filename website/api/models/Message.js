const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  source: {
    type: String,
    enum: ['contact', 'item_list'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobile: {
    type: String
  },
  message: {
    type: String
  },
  quantity: {
    type: String
  },
  items: [
    {
      id: String,
      name: String,
      quantity: Number,
      itemNumber: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Message', MessageSchema);
