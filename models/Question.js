const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const textFieldSchema = new Schema({
  key: String,
  value: String
}, { _id: false });

const questionSchema = new Schema({
  mcqId: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  standard: { type: String, required: true },
  yearOfQues: {
    year: { type: String },
    paper: [{ type: String }]
  },
  question: textFieldSchema,
  1: textFieldSchema,
  2: textFieldSchema,
  3: textFieldSchema,
  4: textFieldSchema,
  answer: { type: String, required: true },
  explanation: textFieldSchema,
  note: { type: String, default: null },
  level: { type: String },
  isImportant: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  visibility: { type: Boolean, default: true },
  new: { type: Boolean, default: false },
  isDelete: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  deletedAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  topicsId: { type: Schema.Types.ObjectId, ref: 'Topic' }
});

module.exports = mongoose.model('Question', questionSchema);
