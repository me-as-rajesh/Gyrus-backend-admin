const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  email: { type: Object }
// subColumns would be defined here, potentially as nested Schemas
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);