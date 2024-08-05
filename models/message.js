// models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: String,
  createdAt: { type: Date, default: Date.now },
  fromStudent: {type: Boolean, required: true},
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  studentRead: {type: Boolean, default: false},
  tutorRead: {type: Boolean, default: false}
});

module.exports = mongoose.model('Message', messageSchema);
