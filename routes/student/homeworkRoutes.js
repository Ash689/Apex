const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const multer = require('multer');
const controller = require('../../controllers/student/homeworkController');
const path = require('path');
const sessionCheckStudent = require('../../middleware/sessionCheckStudent'); // Adjust the path as necessary

router.use(sessionCheckStudent);

const storageStudent = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/homeworkFiles/student');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageStudent, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

// Middleware to serve static files
router.use('/uploads', express.static('uploads'));


router.get('/getHomework', (req, res) => {
  controller.getHomework(req, res);
});

router.post('/uploadHomeworkFile', upload.single('document'), [
  body('generatedAnswer').trim().escape(),
], async (req, res) => {
  controller.uploadHomeworkFile(req, res);
});

router.get('/homeworkFile', (req, res) => {
  controller.homeworkFile(req, res);
});

router.get('/questionFile', (req, res) => {
  controller.questionFile(req, res);
});

router.post('/deleteHomeworkFile', (req, res) => {
  controller.deleteHomeworkFile(req, res);
});

//

router.post('/homework/question', (req, res) => {
  controller.homework(req, res, 'question');
});

router.post('/homework/submission', (req, res) => {
  controller.homework(req, res, 'submission');
});

module.exports = router;