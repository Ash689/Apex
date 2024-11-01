const express = require('express');
const router = express.Router();
const controller = require('../../controllers/student/viewProfileController');
const sessionCheckStudent = require('../../middleware/sessionCheckStudent'); // Adjust the path as necessary

router.use(sessionCheckStudent);

router.get('/apiprofile', (req, res) => {
    controller.apiprofile(req, res);
});

router.get('/userName', (req, res) => {
    controller.userName(req, res);
});

router.post('/alreadyValidated', (req, res) => {
    controller.alreadyValidated(req, res);
});

router.post('/validationComplete', (req, res) => {
    controller.validationComplete(req, res);
});

router.post('/getID', (req, res) => {
    controller.getID(req, res);
});

router.get('/viewProfile', (req, res) => {
    controller.viewProfile(req, res);
});

router.get('/getTutorProfile', (req, res) => {
    controller.getTutorProfile(req, res);
});

router.get('/getTutorProfile2', (req, res) => {
    controller.getTutorProfile2(req, res);
});
  

module.exports = router;