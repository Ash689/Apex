const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const controller = require('../../controllers/student/messageController');
const path = require('path');

const storageMessageStudent = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/messageFiles/student');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    }
});

upload = multer({ storage: storageMessageStudent, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line


router.post('/sendMessage', upload.single('document'), [
  body('content').trim().escape(),
], (req, res) => {
  controller.sendMessage(req, res);
});

router.get('/getMessage', (req, res) => {
  controller.getMessage(req, res);
});

router.get('/viewMessenger', (req, res) => {
  controller.viewMessenger(req, res);
});

router.post('/sendReport', upload.single('document'), [
  body('content').trim().escape(),
  body('topics').trim().escape(),
], (req, res) => {
  controller.sendReport(req, res);
});

router.post('/reviewSubmit', [
  body('review').trim().escape(),
], (req, res) => {
  controller.reviewSubmit(req, res);
});

module.exports = router;
