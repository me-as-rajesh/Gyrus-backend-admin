// models/Test.js
const mongoose = require('mongoose');

const TestSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: 'NEET'
  },
  mcqCount: {
    type: Number,
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  standard: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Test', TestSchema);