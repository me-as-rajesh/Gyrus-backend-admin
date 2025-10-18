const mongoose = require('mongoose');
const { Schema } = mongoose;

// Use a flexible type for answers as it may be an object mapping questionId -> selectedIndex
const reportSchema = new Schema(
  {
    // Who owns the group/test: used to fetch reports per teacher
  teacherEmail: { type: String, required: true, index: true },

    // Student identity
    studentEmail: { type: String },
    studentName: { type: String },

    // Group linkage
    groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
    groupName: { type: String },

    // Test metadata
    testName: { type: String },
    subject: { type: String },
    standard: { type: String },

    // Results
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    answers: { type: Schema.Types.Mixed },
    timeTaken: { type: Number }, // seconds
    date: { type: Date },
  },
  { timestamps: true }
);

// Helpful compound index
reportSchema.index({ teacherEmail: 1, groupId: 1, date: -1 });

module.exports = mongoose.model('Report', reportSchema);