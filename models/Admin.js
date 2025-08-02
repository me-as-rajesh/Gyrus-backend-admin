const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Admin',
    enum: ['Admin', 'Super Admin']
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive']
  }
}, {
  timestamps: true
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;