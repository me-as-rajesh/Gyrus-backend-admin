// models/Fetch.js
const mongoose = require('mongoose');

const FetchSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  }
});

module.exports = mongoose.model('Fetch', FetchSchema);