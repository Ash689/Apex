const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/tutor/forgotPasswordController');
const sessionCheckPassword = require('../../middleware/sessionCheckPasswordTutor'); 
const sessionCheckVerify = require('../../middleware/sessionCheckVerifyTutor'); 

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

router.get('/getEmailReset', sessionCheckPassword, (req, res) => {
  controller.getEmail(req, res);
});

router.get('/getEmailVerify', sessionCheckVerify, (req, res) => {
  controller.getEmailVerify(req, res);
});

router.get('/sendVerification', (req, res) => {
  controller.sendVerification(req, res);
});

router.get('/verify', (req, res) => {
  controller.verify(req, res);
});


module.exports = router;
