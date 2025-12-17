const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
