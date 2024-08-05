// models/message.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: String,
  createdAt: { type: Date, default: Date.now },
  topic: String,
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
