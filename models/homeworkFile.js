const mongoose = require('mongoose');

const homeworkFileSchema = new mongoose.Schema({
  homework: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: String,
  originalname: String,
  mimetype: String,
  size: Number,
  uploadDate: { type: Date, default: Date.now },
  isStudent: {type: Boolean, required: true},
  isText: {type: Boolean, required: true}
});

module.exports = mongoose.model('HomeworkFile', homeworkFileSchema);
