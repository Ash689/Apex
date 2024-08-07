const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/loginRegisterController');
const sessionCheck = require('../middleware/sessionCheck'); 


router.post('/student/register', [
  body('email').trim().escape(),
  body('password').trim().escape(),
  body('repassword').trim().escape(),
], (req, res) => {
  authController.registerUser(req, res, 'student');
});

router.post('/student/login', [
  body('email').trim().escape(),
  body('password').trim().escape(),
], (req, res) => {
  authController.loginUser(req, res, 'student');
});

router.get('/student/logout', (req, res) => {
  authController.logout(req, res, 'student');
});

router.post('/tutor/register', [
  body('email').trim().escape(),
  body('password').trim().escape(),
  body('repassword').trim().escape(),
], (req, res) => {
  authController.registerUser(req, res, 'tutor');
});

router.post('/tutor/login', [
  body('email').trim().escape(),
  body('password').trim().escape(),
], (req, res) => {
  authController.loginUser(req, res, 'tutor');
});

router.get('/tutor/logout', (req, res) => {
  authController.logout(req, res, 'tutor');
});

module.exports = router;
