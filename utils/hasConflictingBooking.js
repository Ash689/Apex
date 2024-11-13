
const Booking = require('../models/booking');
// Function to check for conflicting bookings
async function hasConflictingBooking(tutorID, studentID, startDateTime, endDateTime, bookID){
    return await Booking.findOne({
      _id: { $ne: bookID? bookID: null },
      cancelled: false,
      $or: [
          {
              tutor: tutorID,
              $expr: {
                  $and: [
                      { $lt: ["$date", endDateTime] }, // Booking start time is before the new booking end time
                      { $gt: [{ $add: ["$date", { $multiply: ["$duration", 60 * 1000] }] }, startDateTime] } // Booking end time is after the new booking start time
                  ]
              }
          },
          {
              student: studentID,
              $expr: {
                  $and: [
                      { $lt: ["$date", endDateTime] }, // Booking start time is before the new booking end time
                      { $gt: [{ $add: ["$date", { $multiply: ["$duration", 60 * 1000] }] }, startDateTime] } // Booking end time is after the new booking start time
                  ]
              }
          }
      ]
    });
};


module.exports = hasConflictingBooking;