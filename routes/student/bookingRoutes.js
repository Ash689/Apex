const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/student/bookingController');

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

router.get('/launchingLesson', (req, res) => {
  controller.launchingLesson(req, res);
});


module.exports = router;