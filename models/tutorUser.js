const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, default: null },
  dateOfBirth: { type: Date, default: null },
  town: { type: String, default: null },
  number: {type: Number, default: null},
  subjects: [
    {
      subject: String,
      grade: String,
      learningApproach: String,
      examBoard: String,
      qualification: String
    }
  ],
  daysAvailable: [
    {
      day: { type: String }  // Example: "Monday", "Tuesday", etc.
      // Optionally, you can add more properties here if needed
    }
  ],
  tuitionType: { type: String, default: null },
  price: { type: Number, default: 5.00 },
  isAvailable: {type: Boolean, default: true},
  reviewCount: { type: Number, default: 0 },
  lessonCount: { type: Number, default: 0 },
  revisionCount: { type: Number, default: 0 },
  reviews: [
    {
      reviewScore: Number,
      text: String,
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      date: { type: Date, default: Date.now }
    }
  ],
  f_filename: String,
  f_originalname: String,
  f_mimetype: String,
  f_size: Number,
  f_uploadDate: { type: Date, default: Date.now },
  isPictureVerified: {type: Boolean, default: false},
  flag: {type: Boolean, default: false},
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  isEmailVerified: {type: Boolean, default: false},
  dbs_filename: String,
  dbs_originalname: String,
  dbs_mimetype: String,
  dbs_size: Number,
  isDBSVerified: {type: Boolean, default: false},
  
  id_filename: String,
  id_originalname: String,
  id_mimetype: String,
  id_size: Number,
  isIDVerified: {type: Boolean, default: false},
});

module.exports = mongoose.model('Tutor', tutorSchema);
