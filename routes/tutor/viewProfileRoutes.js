const express = require('express');
const router = express.Router();
const controller = require('../../controllers/tutor/viewProfileController');
const sessionCheckTutor = require('../../middleware/sessionCheckTutor'); // Adjust the path as necessary

router.use(sessionCheckTutor);


router.get('/apiprofile', (req, res) => {
    controller.apiprofile(req, res);
});


router.get('/userName', (req, res) => {
    controller.userName(req, res);
});


router.post('/getID', (req, res) => {
    controller.getID(req, res);
});
router.get('/getBookingProfile', (req, res) => {
    controller.getBookingProfile(req, res);
});

module.exports = router;