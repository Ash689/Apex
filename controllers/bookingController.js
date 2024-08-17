const findUser = require('../utils/findUser');
const Booking = require('../models/booking');
const studentUser = require('../models/studentUser');
const tutorUser = require('../models/tutorUser');
const tempBookingData = require('../models/tempBookingData');
const stripe = require('stripe')(process.env.STRIPE_TOKEN);

exports.getBookingProfile = async(req,res) => {
    try {
        let recipient = await findUser(req, res, "viewMessage", req.session.recipientID, true);
  
        // Find and update related booking for lesson plan
        const relatedBooking = await Booking.findOne({ 
          tutor: recipient._id, 
          student: req.session.user._id,
          revisionSession: false,
          date: { $gt: new Date() }
  
        }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking
  
        res.json({
          recipient: recipient,
          lesson: relatedBooking ? relatedBooking: ""
        });
    } catch (error) {
        console.error(error);
        return res.redirect('/student/viewMessenger.html?message=Failed to retrieve profile.&type=error');
    }
};


exports.viewOldBookings = async (req, res) => {
    try {
      // Determine the role of the authenticated user (true if tutor, false if student)
      const userId = req.session.user._id;
  
      let bookingsQuery;
      let userIdField;
      let userModel;
      let userSelectFields;
  
      if (req.session.user.role === "tutor") {
        bookingsQuery = { tutor: userId, date: { $lt: new Date() } };
        userIdField = 'student';
        userModel = studentUser;
        userSelectFields = 'f_originalname f_filename isPictureVerified';
      } else {
        bookingsQuery = { student: userId, date: { $lt: new Date() } };
        userIdField = 'tutor';
        userModel = tutorUser;
        userSelectFields = 'f_originalname f_filename isPictureVerified';
      }
  
      // Retrieve bookings based on the constructed query
      let bookings1 = await Booking.find(bookingsQuery).sort({ date: -1 });

      let bookings = bookings1.filter(booking => {
        const endTime = new Date(booking.date).getTime() + booking.duration * 60000;
        return new Date() > endTime;
      });
  
      // Extract unique user IDs from the bookings
      let uniqueUserIds = new Set();
      bookings.forEach(booking => {
        uniqueUserIds.add(booking[userIdField].toString());
      });
  
      // Fetch user details including f_originalname and f_filename
      let users = await userModel.find({ _id: { $in: Array.from(uniqueUserIds) } })
        .select(userSelectFields)
        .exec();
  
      // Map user details to bookings
      let bookingsWithUsers = bookings.map(booking => {
        // Find the user corresponding to the booking
        let user = users.find(u => u._id.toString() === booking[userIdField].toString());
        return {
          ...booking._doc, // Include all booking details
          [userIdField]: {
            originalname: user.f_originalname,
            filename: user.isPictureVerified ? user.f_filename : 'TBC.jpg'
          }
        };
      });
  
      res.json({ bookings: bookingsWithUsers });
    } catch (error) {
      console.error(error);
      if (req.session.user.role === "tutor"){
        return res.redirect('/tutor/viewBooking.html?message=Failed to retrieve bookings.&type=error');
      } else {
      return res.redirect('/student/viewBooking.html?message=Failed to retrieve bookings.&type=error');

      }
    }
};

/*
exports.viewDayBookings = async(req, res) => {
    try {
      let bookings;
      if (req.session.user.role === "tutor"){
        bookings = await Booking.find({
          tutor: req.session.user._id,
          date: {
            $gte: Date.now(),
            $lte: new Date().setUTCHours(23, 59, 59, 999)
          }
        }).sort({ date: 1 });
      } else {
        bookings = await Booking.find({
          student: req.session.user._id,
          date: {
            $gte: Date.now(),
            $lte: new Date().setUTCHours(23, 59, 59, 999)
          }
        }).sort({ date: 1 });
      }
        res.json({ bookings });
    } catch (error) {
        console.error(error);
        if (req.session.user.role === "tutor"){
            return res.redirect('/tutor/home.html?message=Failed to retrieve bookings.&type=error');
        }
        return res.redirect('/student/home.html?message=Failed to retrieve bookings.&type=error');
    }
};
*/

exports.viewDayBookings = async(req, res) => {
  try {
      const userId = req.session.user._id;
      const role = req.session.user.role;
      const now = new Date();
      const endOfDay = new Date().setUTCHours(23, 59, 59, 999);

      const query = {
          date: {
              $gte: now,
              $lte: endOfDay
          }
      };

      if (role === "tutor") {
          query.tutor = userId;
      } else {
          query.student = userId;
      }

      const bookings = await Booking.find(query).sort({ date: 1 });
      res.json({ bookings });
  } catch (error) {
      console.error("Error fetching bookings:", error);
      const redirectUrl = res.session.user.role === "tutor" ? '/tutor/home.html' : '/student/home.html';
      res.redirect(`${redirectUrl}?message=Failed to retrieve bookings.&type=error`);
  }
};


exports.viewOneBooking = async(req, res) => {
    try {
      const booking = await Booking.findById(req.session.bookingID);
      res.json({ booking });
    } catch (error) {
      console.error(error);
      if (req.session.user.role === "tutor"){
        return res.redirect('/tutor/editBooking.html?message=Failed to retrieve bookings.&type=error');
      } else {
        return res.redirect('/student/editBooking.html?message=Failed to retrieve bookings.&type=error');
      }
    }
};


exports.viewIndividualBookings = async (req, res) => {
  try {
    let recipient = await findUser(req, res, "viewMessage", req.session.recipientID, true);

    const query = {
      date: {
        $gte: Date.now(),
      }
    };

    if (req.session.user.role === "tutor") {
      query.tutor = req.session.user._id;
      query.student = recipient._id;
    } else {
      query.tutor = recipient._id;
      query.student = req.session.user._id;
    }

    // Retrieve bookings based on the constructed query
    const bookings = await Booking.find(query).sort({ date: 1 });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    if (req.session.user.role === "tutor") {
      return res.redirect('/tutor/viewMessage.html?message=Failed to retrieve bookings.&type=error');
    } else {
      return res.redirect('/student/viewMessage.html?message=Failed to retrieve bookings.&type=error');
    }
  }
};

exports.viewBookings = async (req, res) => {
    try {
      // Determine whether the user is a tutor (true) or student (false)
      const isTutor = req.session.user.role === "tutor";
  
      // Create a dynamic query based on the user's role
      const query = {
        date: { $gt: Date.now() }
      };
      query[isTutor ? 'tutor' : 'student'] = req.session.user._id;
  
      // Retrieve bookings based on the constructed query
      const bookings = await Booking.find(query).sort({ date: 1 });
  
      // Extract unique user IDs from the bookings
      const uniqueIds = new Set();
      bookings.forEach(booking => {
        uniqueIds.add((isTutor ? booking.student : booking.tutor).toString());
      });
  
      // Fetch user details based on the role
      const userModel = isTutor ? studentUser : tutorUser;
      const users = await userModel.find({ _id: { $in: Array.from(uniqueIds) } })
        .select('f_originalname f_filename isPictureVerified')
        .exec();
  
      // Map user details to bookings
      const bookingsWithUsers = bookings.map(booking => {
        const userIdToFind = isTutor ? booking.student.toString() : booking.tutor.toString();
        const user = users.find(u => u._id.toString() === userIdToFind);
        return {
          ...booking._doc, // Include all booking details
          [isTutor ? 'student' : 'tutor']: {
            originalname: user.f_originalname,
            filename: user.isPictureVerified ? user.f_filename : 'TBC.jpg'
          }
        };
      });
  
      res.json({ bookings: bookingsWithUsers });
    } catch (error) {
      console.error(error);
      const errorPage = req.session.user.role  === "tutor" ? '/tutor/viewBooking.html' : '/student/viewBooking.html';
      return res.redirect(`${errorPage}?message=Failed to retrieve bookings.&type=error`);
    }
};

exports.getBookingID = async(req, res) => {
    const { bookingId } = req.body;
    req.session.bookingID = bookingId;
    const linkPage = req.session.user.role === "tutor" ? '/tutor/editBooking.html' : '/student/editBooking.html';
    return res.redirect(`${linkPage}`);
};

exports.getBookingID2 = async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  let user;
  let linkPage;
  if (req.session.user.role === "tutor") {
    user = await findUser(req, res, "viewBooking", booking.student._id, true);
    linkPage = '/tutor/viewMessage.html';
  } else {
    user = await findUser(req, res, "viewBooking", booking.tutor._id, true);
    linkPage = '/student/viewMessage.html';
  }
  req.session.recipientID = user._id;
  res.redirect(`${linkPage}`);
};

exports.cancelChanges = async (req, res) => {
    const { bookingId, returnUrl } = req.body;
  
    try {
      const booking = await Booking.findById(bookingId);
      const tempBooking = await tempBookingData.findOne({ booking: bookingId });
  
      // Update booking details with temporary booking data
      booking.subject = tempBooking.subject;
      booking.date = tempBooking.date;
      booking.time = tempBooking.time;
      booking.duration = tempBooking.duration;
      booking.price = tempBooking.price;
  
      // Set the correct confirmation flag based on the user's role
      let linkPage;
      if (req.session.user.role === "tutor") {
        linkPage = `/tutor/${returnUrl}.html`;
        booking.studentConfirmed = true;
      } else {
        linkPage = `/student/${returnUrl}.html`;
        booking.tutorConfirmed = true;
      }
  
      await booking.save();
      await tempBookingData.deleteOne({ booking: bookingId });
  
      res.redirect(`${linkPage}?message=Lesson changes cancelled.&type=success`);
    } catch (error) {
      console.error(error);
      res.redirect(`${linkPage}?message=Server error.&type=error`);
    }
};

exports.cancelOneBooking = async(req, res) => {
    try {
      const booking = await Booking.findById(req.session.bookingID);
  
      // Find and update related booking for lesson plan
      const relatedBooking = await Booking.findOne({ 
          tutor: booking.tutor, 
          student: booking.student, 
          subject: booking.subject,
          date: { $gt: booking.date }  // Find bookings with a date greater than the current booking date
        }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking
  
      if (relatedBooking) {
        relatedBooking.plan = booking.plan;
        await relatedBooking.save();
      }

  
      let deletedBooking = await Booking.findByIdAndDelete(req.session.bookingID);

      if (deletedBooking) {
        const session = await stripe.checkout.sessions.retrieve(deletedBooking.stripeSession);

        // Refund the payment
        const refund = await stripe.refunds.create({
            payment_intent: session.payment_intent,
        });
      } else {
        return res.redirect('/tutor/viewBooking.html?message=Failed to cancel booking.&type=error');
      }


      let linkPage;

      if(req.session.user.role === "tutor") {
          linkPage = `/tutor/`;
      } else {
          linkPage = `/student/`;
      }
      return res.redirect(`${linkPage}viewBooking.html?message=Booking canceled successfully.&type=success`);
    } catch (error) {
      console.error(error);
      return res.redirect(`${linkPage}editBooking.html?message=Failed to cancel booking.&type=error`);
    }
};
  

exports.cancelRecurringBooking = async(req, res) => {
    try {
      const booking = await Booking.findById(req.session.bookingID);
      let linkPage;
      if (req.session.user.role === "tutor"){
          linkPage = '/tutor/';
      } else {
          linkPage = '/student/';
      }
      if (!booking) {
        return res.redirect(`${linkPage}editBooking.html?message=Booking not found.&type=error`);
      }
  
      if (!booking.recurringID) {
        return res.redirect(`${linkPage}/editBooking.html?message=Booking is not part of a recurring series.&type=error`);
      }
  
      // Delete all bookings with the same recurringID
      const deletedBookings = await Booking.deleteMany({ recurringID: booking.recurringID });
  
      if (!deletedBookings.deletedCount) {
        return res.redirect(`${linkPage}editBooking.html?message=No recurring bookings found to cancel.&type=error`);
      }
  
      return res.redirect(`${linkPage}editBooking.html?message=Recurring bookings canceled successfully.&type=success`);
    } catch (error) {
      console.error(error);
      return res.redirect(`${linkPage}editBooking.html?message=Failed to edit booking.&type=error`);
    }
};
  
  