const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  regNo: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    uppercase: true,
    index: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Group ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search
studentSchema.index({
  name: 'text',
  regNo: 'text'
});

module.exports = mongoose.model('Student', studentSchema);