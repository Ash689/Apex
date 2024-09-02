const mongoose = require('mongoose');

const tempBookingDataSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  time: {type: String, required: true},
  duration: {type: Number, required: true},
  revisionSession: {type: Boolean, default: false},
  price: { type: Number, required: true}
});

module.exports = mongoose.model('tempBookingData', tempBookingDataSchema);
