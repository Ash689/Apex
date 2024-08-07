const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const controller = require('../../controllers/tutor/homeworkController');
const path = require('path');
const sessionCheckTutor = require('../../middleware/sessionCheckTutor'); // Adjust the path as necessary

router.use(sessionCheckTutor);


const storageTutor = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/homeworkFiles/tutor');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageTutor, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

router.get('/getHomework', (req, res) => {
  controller.getHomework(req, res);
});

router.post('/uploadHomeworkFile', upload.single('document'), [
  body('generatedQuestions').trim().escape(),
], async (req, res) => {
  controller.uploadHomeworkFile(req, res);
});

router.get('/homeworkFile', (req, res) => {
  controller.homeworkFile(req, res);
});

router.get('/submissionFile', (req, res) => {
  controller.submissionFile(req, res);
});

router.get('/questionFile', (req, res) => {
  controller.questionFile(req, res);
});

router.post('/deleteHomeworkFile', (req, res) => {
  controller.deleteHomeworkFile(req, res);
});

router.post('/homework/question', (req, res) => {
  controller.homework(req, res, 'question');
});

router.post('/homework/submission', (req, res) => {
  controller.homework(req, res, 'submission');
});

router.post('/homework/score', (req, res) => {
  controller.homework(req, res, 'score');
});

router.post('/homework/deadline', (req, res) => {
  controller.homework(req, res, 'deadline');
});

router.post('/generateQuestions', (req, res) => {
  controller.generateQuestions(req, res);
});

router.post('/addHomework', upload.single('document'), [
  body('topicName').trim().escape(),
], async (req, res) => {
  controller.addHomework(req, res);
});

router.get('/viewIndividualHomework', (req, res) => {
  controller.viewIndividualHomework(req, res);
});

router.post('/changeDeadline', (req, res) => {
  controller.changeDeadline(req, res);
});

router.post('/changeScore', (req, res) => {
  controller.changeScore(req, res); // Fixed method name to match the controller's method
});


module.exports = router;