const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, default: null },
  dateOfBirth: { type: Date, default: null },
  town: { type: String, default: null },
  number: {type: Number, default: null},
  subjects: [
    {
      subject: String,
      expectedGrade: String,
      desiredGrade: String,
      learningApproach: String,
      examBoard: String,
      qualification: String
    }
  ],
  lessonCount: { type: Number, default: 0 },
  revisionCount: { type: Number, default: 0 },
  f_filename: String,
  f_originalname: String,
  f_mimetype: String,
  f_size: Number,
  f_uploadDate: { type: Date, default: Date.now },
  flag: {type: Boolean, default: false}
});

module.exports = mongoose.model('Student', studentSchema);


