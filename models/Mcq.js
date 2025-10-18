const mongoose = require('mongoose');

const mapSchema = new mongoose.Schema({
  key: { type: String },
  value: { type: String },
  _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }
});

const yearOfQuesSchema = new mongoose.Schema({
  year: { type: String },
  paper: { type: [String], default: [] }
});

const QuestionSchema = new mongoose.Schema({
  mcqId: { type: String, unique: true },
  standard: { type: String },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  subjectName: { type: String },
  topicsId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  topicName: { type: String },
  yearOfQues: { type: [yearOfQuesSchema], default: [] },
  level: { type: String },
  question: mapSchema,
  1: mapSchema,
  2: mapSchema,
  3: mapSchema,
  4: mapSchema,
  answer: { type: String },
  explanation: mapSchema,
  note: mapSchema,
  approved: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  new: { type: Boolean, default: false },
  visibility: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  updatedAt: { type: Date },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  isDelete: { type: Boolean, default: false },
}, { collection: 'questions' });


module.exports = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
