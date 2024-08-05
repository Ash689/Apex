const findUser = require('../../utils/findUser');
const { generateAccessToken, createZoomMeeting } = require('../../utils/zoomMeeting');
const Booking = require('../../models/booking');
const tempBookingData = require('../../models/tempBookingData');
const { body, validationResult } = require('express-validator');
const hasConflictingBooking = require('../../utils/hasConflictingBooking');

exports.confirmLesson = async(req, res) => {
    const { bookingId, returnUrl } = req.body;

    try {

        const booking = await Booking.findById(bookingId);

        if (!booking) {
        return res.redirect(`/student/${returnUrl}.html?message=Booking not found.&type=error`);
        }

        if (booking.recurringID) {
        await Booking.updateMany(
            { recurringID: booking.recurringID },
            { $set: { studentConfirmed: true, paymentGiven: true } } // Add other fields if needed
        );

        } else {
        booking.studentConfirmed = true;
        booking.paymentGiven = true;
        await booking.save();
        }
        res.redirect(`/student/${returnUrl}.html?message=Booking confirmed!&type=success`);
    } catch (error) {
        console.log(error);
        res.redirect(`/student/${returnUrl}.html?message=Server error.&type=error`);
    }
};


exports.editBooking = async(req, res) => {
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

        let tempBooking = await tempBookingData.findOne({booking: req.session.bookingID});
        if (!tempBooking){
        let tempBooking2 = new tempBookingData({
            booking: req.session.bookingID,
            subject: editBooking.subject,
            date: editBooking.date,
            time: editBooking.time,
            price: editBooking.price,
            duration: editBooking.duration,
        });
        await tempBooking2.save();    
        }

        editBooking.subject = subject;
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

exports.launchingLesson = async(req, res) => {
  const { zoomUrl } = req.query;
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting...</title>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          // Redirect to Zoom meeting
          window.location.href = "${zoomUrl}";
          // Open lesson notes in a new tab
          window.open('/student/newReview.html', '_blank');
        });
      </script>
    </head>
    <body>
      <p>Redirecting to your Zoom meeting and opening review...</p>
    </body>
    </html>
  `);
};

exports.launchLesson = async(req, res) => {
    const { bookingId } = req.body;
    try {
        req.session.bookingID = bookingId;
        const booking = await Booking.findById(req.session.bookingID);
        let user = await findUser(req, res, "viewBooking", booking.student._id);
        if(booking.revisionSession){
        user.revisionCount = user.revisionCount+1;
        await user.save();
        } else {
        user.lessonCount = user.lessonCount+1;
        await user.save();
        }
        if(!booking.zJoinUrl){
        const token = await generateAccessToken();
        let tutor = await findUser(req, res, "viewBooking", booking.tutor, true);
    
        const meetingData = await createZoomMeeting(token, tutor.email, booking.revisionSession? 'Revision Session': 'Tutoring Session', booking.time, booking.duration);
        booking.zMeetingId = meetingData.id;
        booking.zMeetingPassword = meetingData.password;
        booking.zJoinUrl = meetingData.join_url;
        await booking.save();
        }
        return res.redirect(`/student/launchingLesson?zoomUrl=${encodeURIComponent(booking.zJoinUrl)}`);

    } catch (error) {
        console.error(error);
        return res.redirect('/student/viewBooking.html?message=Failed to create zoom meeting.&type=error');
    }
};

