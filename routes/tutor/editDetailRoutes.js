const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/tutor/editDetailsController');
const multer = require('multer');
const path = require('path');
const sessionCheckTutor = require('../../middleware/sessionCheckTutor'); // Adjust the path as necessary

router.use(sessionCheckTutor);


const storageTutorPicture = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/profileFiles/tutor');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});
  
let upload = multer({ storage: storageTutorPicture, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line
  
// router.post('/config', upload.single('profile-photo'), [

router.post('/config', upload.single('profile-photo'), [
  body('fullName').trim().escape(),
  body('town').trim().escape(),
  body('number').trim().escape(),
  body('tutitionType').trim().escape(),
], (req, res) => {
  controller.config(req, res);
});

router.post('/addSubject', [
  body('subject').trim().escape(),
  body('qualification').trim().escape(),
  body('grade').trim().escape(),
  body('teachingApproach').trim().escape(),
  body('examBoard').trim().escape(),
], (req, res) => {
  controller.addSubject(req, res);
});

router.post('/cancelSubject', (req, res) => {
  controller.cancelSubject(req, res);
});

router.post('/addDays', (req, res) => {
  controller.addDays(req, res);
});

router.post('/changePic', upload.single('profile-photo'), (req, res) => {
  controller.changePic(req, res);
});

router.post('/changePrice', (req, res) => {
  controller.changePrice(req, res);
});

router.post('/changeTuitionType', (req, res) => {
  controller.changeTuitionType(req, res);
});

router.post('/changeAvailability', (req, res) => {
  controller.changeAvailability(req, res);
});

router.post('/forgotPassword', [
  body('email').trim().escape(),
], (req, res) => {
  controller.forgotPassword(req, res);
});

router.post('/changePassword', [
  body('password').trim().escape(),
], (req, res) => {
  controller.changePassword(req, res);
});

router.get('/getEmail', (req, res) => {
  controller.getEmail(req, res);
});

module.exports = router;
