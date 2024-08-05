const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/student/editDetailsController');
const multer = require('multer');
const path = require('path');


const storageStudentPicture = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profileFiles/student');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

let upload = multer({ storage: storageStudentPicture, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

// router.post('/config', upload.single('profile-photo'), [

router.post('/config', upload.single('profile-photo'), [
  body('fullName').trim().escape(),
  body('town').trim().escape(),
], (req, res) => {
  controller.config(req, res);
});

router.post('/addSubject', [
  body('subject').trim().escape(),
  body('qualification').trim().escape(),
  body('expectedGrade').trim().escape(),
  body('desiredGrade').trim().escape(),
  body('learningApproach').trim().escape(),
  body('examBoard').trim().escape(),
], (req, res) => {
  controller.addSubject(req, res);
});
router.post('/cancelSubject', (req, res) => {
  controller.cancelSubject(req, res);
});

router.post('/changePic', upload.single('profile-photo'), (req, res) => {
  controller.changePic(req, res);
});


module.exports = router;
