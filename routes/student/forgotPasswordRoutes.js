const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/student/forgotPasswordController');
const sessionCheckPassword = require('../../middleware/sessionCheckPasswordStudent'); 
const sessionCheckVerify = require('../../middleware/sessionCheckVerifyStudent'); 

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
  controller.getEmailReset(req, res);
});

router.get('/getEmailVerify', sessionCheckVerify, (req, res) => {
  controller.getEmailVerify(req, res);
});

router.get('/sendVerification', (req, res) => {
  controller.sendVerification(req, res);
});

router.post('/verify', (req, res) => {
  controller.verify(req, res);
});

module.exports = router;
