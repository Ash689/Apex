// models/message.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorName: {type: String, required: true},
  studentName: {type: String, required: true},
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  time: {type: String, required: true},
  duration: {type: Number, required: true},
  tutorConfirmed: {type: Boolean, default: true},
  studentConfirmed: {type: Boolean, default: false},
  recurringID: {type: String, default: null},
  plan: {type: String, default: "Not planned"},
  paymentGiven: {type: Boolean, default: false},
  price: { type: Number, required: true},
  notes: [{ type: String }],
  successNotes: {type: String},
  weakNotes: {type: String},
  revisionSession: {type: Boolean, default: false},
  zMeetingId: {type: String, default: ""},
  zMeetingPassword: {type: String},
  zJoinUrl: {type: String, default: ""},
  stripeIntent: {type: String, default: null},
  cancelled: {type: Boolean, default: false},
});

module.exports = mongoose.model('Booking', bookingSchema);
