const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const controller = require('../../controllers/student/findTutorController');

router.get('/findTutors', (req, res) => {
    controller.findTutors(req, res);
});
  
router.post('/findTutorProfile', (req, res) => {
    controller.findTutorProfile(req, res);
});

module.exports = router;