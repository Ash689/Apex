// models/message.js
const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  posted: { type: Date, required: true },
  topicName: { type: String, required: true },
  deadline: { type: Date, required: true },
  submission: {type: Boolean, default: false},
  score: {type: Number, default: 0},
  docCount: {type: Number, default: 0}
});

module.exports = mongoose.model('Homework', homeworkSchema);
