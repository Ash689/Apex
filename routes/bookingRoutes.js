const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');
const sessionCheck = require('../middleware/sessionCheck'); // Adjust the path as necessary

router.use(sessionCheck);

router.get('/getBookingProfile', (req, res) => {
  controller.getBookingProfile(req, res);
});

router.get('/viewOldBookings', (req, res) => {
  controller.viewOldBookings(req, res);
});
router.get('/viewDayBookings', (req, res) => {
  controller.viewDayBookings(req, res);
});

router.get('/viewOneBooking', (req, res) => {
  controller.viewOneBooking(req, res);
});

router.get('/viewIndividualBookings', (req, res) => {
  controller.viewIndividualBookings(req, res);
});

router.get('/viewBookings', (req, res) => {
  controller.viewBookings(req, res);
});

router.post('/getBookingID', (req, res) => {
  controller.getBookingID(req, res);
});

router.post('/getBookingID2', (req, res) => {
  controller.getBookingID2(req, res);
});

router.post('/cancelChanges', (req, res) => {
  controller.cancelChanges(req, res);
});

router.post('/cancelOneBooking', (req, res) => {
  controller.cancelOneBooking(req, res);
});

router.post('/cancelRecurringBooking', (req, res) => {
  controller.cancelRecurringBooking(req, res);
});

module.exports = router;
