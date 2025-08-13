const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  regNo: {
    type: String,
    required: [true, 'Registration number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Student email is required'],
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other'],
    trim: true
  },
  dob: {
    type: Date,
    required: [true, 'Date of Birth is required'],
    trim: true
  }
}, { _id: false });

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    enum: ['11', '12'],
    trim: true
  },
  teacherEmail: {  
    type: String,
    required: [true, 'Teacher email is required'],
    ref: 'Teacher',
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  students: [studentSchema],
  maxStudents: {
    type: Number,
    default: 100,
    min: [1, 'Maximum students must be at least 1'],
    max: [100, 'Maximum students cannot exceed 100']
  },
  currentStudentCount: {
    type: Number,
    default: 0,
    min: [0, 'Student count cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-count students before save
groupSchema.pre('save', function(next) {
  this.currentStudentCount = this.students.length;
  if (this.students.length > this.maxStudents) {
    throw new Error(`Cannot exceed maximum of ${this.maxStudents} students`);
  }
  next();
});


//groupSchema.index({ 'students.regNo': 1 }, { unique: false });

// Commented out the unique regNo validation to allow duplicates
// groupSchema.pre('save', function(next) {
//   const regNos = this.students.map(s => s.regNo);
//   if (new Set(regNos).size !== regNos.length) {
//     throw new Error('Duplicate registration numbers in group');
//   }
//   next();
// });

module.exports = mongoose.model('Group', groupSchema);