const Booking = require('../models/booking');
async function getLessonsScheduledIn24Hours() {
    try {
      const now = new Date();
      const twentyFourHoursLater = new Date(now);
      twentyFourHoursLater.setHours(now.getHours() + 24);
  
      // Query to find lessons starting exactly 24 hours later
      const bookings = await Booking.find({
        startTime: {
          $gte: twentyFourHoursLater, // Greater than or equal to 24 hours from now
          $lt: new Date(twentyFourHoursLater.getTime() + 3600000) // Up to 25 hours from now (1 hour window)
        },
        paymentGiven: false,
      });
  
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }


module.exports = offSessionPayment;