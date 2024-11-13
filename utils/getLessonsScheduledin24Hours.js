const Booking = require('../models/booking');
async function getLessonsScheduledIn24Hours() {
    try {
  

      const bookings = await Booking.find ({
        date: { 
          $gt: new Date(Date.now() - 60*60*1000),
          $lt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        
        cancelled: false,
        paymentGiven: false,
        tutorConfirmed: true,
        studentConfirmed: true
      });
  
      return bookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }


module.exports = getLessonsScheduledIn24Hours;