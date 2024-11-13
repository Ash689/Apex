// models/message.js
const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema({
  totalAmount: { type: Number, default: 0},
  currentAmount: { type: Number, default: 0},
  name: {type: String, required: true},
});

module.exports = mongoose.model('Charity', charitySchema);
