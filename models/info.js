const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  regNo: String
});

const testSchema = new mongoose.Schema({
  title: String,
  date: Date,
  time: String,
  subject: String,
  mcqs: Number
});

const groupSchema = new mongoose.Schema({
  groupName: String,
  section: String,
  teacherEmail: { type: String, required: true },
  maxStudents: Number,
  currentStudentCount: Number,
  students: [studentSchema],
  tests: [testSchema]
});

// ✅ Prevent model overwrite on hot-reload
module.exports = mongoose.models.Group || mongoose.model('Group', groupSchema);
