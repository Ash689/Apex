const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const controller = require('../../controllers/tutor/bookingController');
const path = require('path');
const sessionCheckTutor = require('../../middleware/sessionCheckTutor'); // Adjust the path as necessary

router.use(sessionCheckTutor);

router.post('/confirmLesson', (req, res) => {
  controller.confirmLesson(req, res);
});

router.post('/editBooking', [
  body('subject').trim().escape(),
], async (req, res) => {
  controller.editBooking(req, res);
});

router.post('/launchLesson', (req, res) => {
  controller.launchLesson(req, res);
});

router.get('/getZoomLink', (req, res) => {
  controller.getZoomLink(req, res);
});

router.post('/launchReport', (req, res) => {
  controller.launchReport(req, res);
});

// Set up multer for file uploads
const storageTutor = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/homeworkFiles/tutor');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageTutor, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

router.post('/lessonReportSubmit', upload.single('document'), [
  body('topics').trim().escape(),
  body('successTopics').trim().escape(),
  body('weakTopics').trim().escape(),
  body('nextLessonPlan').trim().escape(),
  body('topicName').trim().escape(),
  body('generatedQuestions').trim().escape(),
], (req, res) => {
  controller.lessonReportSubmit(req, res);
});

router.get('/getLessonNotes', (req, res) => {
  controller.getLessonNotes(req, res);
});

router.get('/getStudentProfileNotes', (req, res) => {
  controller.getStudentProfileNotes(req, res);
})

router.post('/lessonNotesSubmit', upload.single('document'), [
  body('topics').trim().escape()
], (req, res) => {
  controller.lessonNotesSubmit(req, res);
});

router.post('/newBooking', [
  body('subject').trim().escape(),
], (req, res) => {
  controller.newBooking(req, res);
});


module.exports = router;