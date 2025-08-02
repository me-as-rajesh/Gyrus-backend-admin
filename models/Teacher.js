const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    index: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  phone: {
    type: String,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  groups: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }]
});

// Add text index for search functionality
teacherSchema.index({
  name: 'text',
  email: 'text',
  department: 'text'
});

// Cascade delete groups when teacher is removed
teacherSchema.pre('remove', async function(next) {
  try {
    await mongoose.model('Group').deleteMany({ teacherEmail: this.email });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Teacher', teacherSchema);