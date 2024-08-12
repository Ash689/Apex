const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/student/editDetailsController');
const multer = require('multer');
const path = require('path');
const sessionCheckStudent = require('../../middleware/sessionCheckStudent'); // Adjust the path as necessary

router.use(sessionCheckStudent);

const storageStudentPicture = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profileFiles/student/profilePicture');
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


const storageStudentID = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profileFiles/student/id');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageStudentID, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line


router.post('/sendID', upload.single('document'), [
  body('description').trim().escape(),
], (req, res) => {
  controller.sendID(req, res);
});

router.get('/getVerifyID', (req, res) => {
  controller.getVerifyID(req, res);
});


module.exports = router;
