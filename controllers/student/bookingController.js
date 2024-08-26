const findUser = require('../../utils/findUser');
const formatInput = require('../../utils/formatInput');
const { generateAccessToken, createZoomMeeting } = require('../../utils/zoomMeeting');
const Booking = require('../../models/booking');
const tempBookingData = require('../../models/tempBookingData');
const { body, validationResult } = require('express-validator');
const hasConflictingBooking = require('../../utils/hasConflictingBooking');
const payment = require('../../utils/payment');
const stripe = require('stripe')(process.env.STRIPE_TOKEN);

exports.confirmLesson = async (req, res) => {
  const { bookingId, returnUrl } = req.body;

  try {

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.redirect(`/student/${returnUrl}.html?message=Booking not found.&type=error`);
    }
    req.session.bookingID = bookingId;
    req.session.returnUrl = returnUrl;

    if (booking.recurringID) {
      await Booking.updateMany(
        { recurringID: booking.recurringID },
        { $set: { 
          studentConfirmed: true, 
      }});

    } else {
      booking.studentConfirmed = true;
      await booking.save();
    }
    
    res.redirect(`/student/${returnUrl}.html?message=Booking/s confirmed.&type=success`);
  } catch (error) {
    console.log(error);
    res.redirect(`/student/${returnUrl}.html?message=Server error.&type=error`);
  }
};


exports.editBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/student/editBooking.html?message=Invalid input.&type=error');
  }
  const { subject, bookingDate, bookingTime, duration } = req.body;

  try {
    // Convert bookingDate and bookingTime into a Date object

    const bookingStartDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
    const bookingEndDateTime = new Date(bookingStartDateTime.getTime() + duration * 60 * 1000);

    // Check if the booking start time is in the past
    const now = new Date();
    if (bookingStartDateTime < now) {
      return res.redirect('/student/editBooking.html?message=Booking time cannot be in the past.&type=error');
    }

    // Find the booking to be edited
    const editBooking = await Booking.findById(req.session.bookingID);
    if (!editBooking) {
      return res.redirect('/student/editBooking.html?message=Booking not found.&type=error');
    }
    // Check for conflicts
    if (await hasConflictingBooking(editBooking.tutor._id, req.session.user._id, bookingStartDateTime, bookingEndDateTime, editBooking._id)) {
      return res.redirect('/student/editBooking.html?message=This time slot is not available.&type=error');
    }

    let tempBooking = await tempBookingData.findOne({ booking: req.session.bookingID });
    let formatted_subject = await formatInput(editBooking.subject);
    if (!tempBooking) {
      let tempBooking2 = new tempBookingData({
        booking: req.session.bookingID,
        subject: formatted_subject,
        date: editBooking.date,
        time: editBooking.time,
        price: editBooking.price,
        duration: editBooking.duration,
      });
      await tempBooking2.save();
    }

    let formatted_subject2 = await formatInput(subject);

    editBooking.subject = formatted_subject2;
    editBooking.date = bookingStartDateTime;
    editBooking.time = bookingTime;
    editBooking.duration = duration;
    editBooking.tutorConfirmed = false;
    editBooking.studentConfirmed = true;

    // Save the booking
    await editBooking.save();

    res.redirect('/student/viewBooking.html?message=Booking edited successfully.&type=success');
  } catch (error) {
    console.error(error);
    return res.redirect('/student/viewBooking.html?message=Failed to edit booking.&type=error');
  }
};

exports.launchLesson = async (req, res) => {
  const { bookingId } = req.body;
  try {
    req.session.bookingID = bookingId;
    const booking = await Booking.findById(req.session.bookingID);
    let user = await findUser(req, res, "viewBooking", booking.student._id);
    if (booking.revisionSession) {
      user.revisionCount = user.revisionCount + 1;
      await user.save();
    } else {
      user.lessonCount = user.lessonCount + 1;
      await user.save();
    }
    req.session.recipientID = booking.tutor;
    if (!booking.zJoinUrl) {
      const token = await generateAccessToken();
      let tutor = await findUser(req, res, "viewBooking", booking.tutor, true);

      const meetingData = await createZoomMeeting(token, tutor.email, booking.revisionSession ? 'Revision Session' : 'Tutoring Session', booking.time, booking.duration);
      booking.zMeetingId = meetingData.id;
      booking.zMeetingPassword = meetingData.password;
      booking.zJoinUrl = meetingData.join_url;
      await booking.save();
      
    }

    req.session.zoomLink = booking.zJoinUrl;
    
    return res.redirect('/student/newReview.html?zoom=true');

  } catch (error) {
    console.error(error);
    return res.redirect('/student/viewBooking.html?message=Failed to create zoom meeting.&type=error');
  }
};

exports.getZoomLink = async (req, res) => {
  try {
    if (req.session.zoomLink){
      res.json({
        link: req.session.zoomLink
      });
    } else { 
      res.json({
        error: "error"
      });
    }
  } catch (error) {
    console.error(error);
    return res.redirect('/student/newReview.html?message=Failed to create zoom meeting.&type=error');
  }
};



exports.payLesson = async (req, res) => {
  const { bookingId, returnUrl} = req.body;

  try{

    req.session.bookingID = bookingId;

    let sessionUrl = await payment(req.session.bookingID, returnUrl);
    res.json({
      session: sessionUrl
    });
  } catch (error) {
    console.error(error);
    return res.redirect(`/student/${returnUrl}.html?message=Failed to confirm booking.&type=error`);
  }
};



exports.updatePaymentMethod = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(String(sessionId));
    if (session.payment_intent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
  
      // The default payment method attached to the customer after payment
      const paymentMethodId = paymentIntent.payment_method;
  
      let user = await findUser(req, res, "viewBooking", req.session.user._id);

      user.defaultPaymentMethod = paymentMethodId;
      await user.save();

      let booking = await Booking.findById(req.session.bookingID);
      booking.stripeIntent = session.payment_intent.id;
      booking.paymentGiven = true;
      await booking.save();
  
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }

  } catch (error) {
    console.log(error);
    return res.redirect(`/student/viewBooking.html?message=Failed to setup payment for future lessons.&type=error`);
  }
};


exports.clearBanking = async (req, res) => {
  try {  
      let user = await findUser(req, res, "viewBooking", req.session.user._id);
      if(user.defaultPaymentMethod){
        user.defaultPaymentMethod = null;
        await user.save();
        return res.redirect(`/student/home.html?message= Payment method cleared for future lessons, the next lesson will prompt for new payment details.&type=success`);
      } else {
        return res.redirect(`/student/home.html?message=Existing payment method not found.&type=error`);
      }
  } catch (error) {
    console.log(error);
    return res.redirect(`/student/home.html?message=Error in clearing banking details.&type=error`);
  }
};

