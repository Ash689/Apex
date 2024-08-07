const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/student/forgotPasswordController');
const sessionCheckStudent = require('../../middleware/sessionCheckPasswordStudent'); // Adjust the path as necessary

router.post('/forgotPassword', [
  body('email').trim().escape(),
], (req, res) => {
  controller.forgotPassword(req, res);
});

router.post('/codeEntry', (req, res) => {
  controller.codeEntry(req, res);
});

router.post('/changePassword', [
  body('password').trim().escape(),
], (req, res) => {
  controller.changePassword(req, res);
});

router.get('/getEmail', sessionCheckStudent, (req, res) => {
  controller.getEmail(req, res);
});


module.exports = router;
