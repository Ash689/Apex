const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/student/findTutorController');
const sessionCheckStudent = require('../../middleware/sessionCheckStudent'); // Adjust the path as necessary

router.use(sessionCheckStudent);

router.get('/findTutors', (req, res) => {
    controller.findTutors(req, res);
});
  
router.post('/findTutorProfile', (req, res) => {
    controller.findTutorProfile(req, res);
});

module.exports = router;