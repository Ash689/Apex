const findUser = require('../../utils/findUser'); // Assuming you have a utility function for this
const { generateAccessToken, createZoomMeeting } = require('../../utils/zoomMeeting');
const Homework = require('../../models/homework');
const studentUser = require('../../models/studentUser');
const Message = require('../../models/message');
const Booking = require('../../models/booking');
const HomeworkFile = require('../../models/homeworkFile');
const tempBookingData = require('../../models/tempBookingData');
const { body, validationResult } = require('express-validator');
const hasConflictingBooking = require('../../utils/hasConflictingBooking');
const { v4: uuidv4 } = require('uuid');
const formatInput = require('../../utils/formatInput');

exports.confirmLesson = async(req, res) => {
  const { bookingId, returnUrl } = req.body;

  try {

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.redirect(`/tutor/${returnUrl}.html?message=Booking not found.&type=error`);
    }

    if (booking.recurringID) {
      // Confirm all bookings with the same recurringID
      await Booking.updateMany(
        { recurringID: booking.recurringID },
        { $set: { tutorConfirmed: true } } // Add other fields if needed
      );
    } else {

      booking.tutorConfirmed = true;
      await booking.save();
    }

    res.redirect(`/tutor/${returnUrl}.html?message=Booking confirmed!&type=success`);
  } catch (error) {
    console.log(error);
    res.redirect(`/tutor/${returnUrl}.html?message=Server error.&type=error`);
  }
};

exports.editBooking = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/editBooking.html?message=Invalid input.&type=error');
  }
  const { revision, subject, bookingDate, bookingTime, bookingPrice, duration } = req.body;

  try {
    
    const bookingStartDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
    const bookingEndDateTime = new Date(bookingStartDateTime.getTime() + duration * 60 * 1000);

    // Check if the booking start time is in the past
    const now = new Date();
    if (bookingStartDateTime < now) {
      return res.redirect('/tutor/editBooking.html?message=Booking time cannot be in the past.&type=error');
    }

    // Find the booking to be edited
    const editBooking = await Booking.findById(req.session.bookingID);
    if (!editBooking) {
      return res.redirect('/tutor/editBooking.html?message=Booking not found.&type=error');
    }


    // Check for conflicts
    if (await hasConflictingBooking(req.session.user._id, editBooking.student._id, bookingStartDateTime, bookingEndDateTime, editBooking._id)) {
      return res.redirect('/tutor/editBooking.html?message=This time slot is not available.&type=error');
    }
    let tempBooking = await tempBookingData.findOne({booking: req.session.bookingID});
    if (!tempBooking){
      let formatted_subject = await formatInput(editBooking.subject);
      let tempBooking2 = new tempBookingData({
        booking: req.session.bookingID,
        subject: formatted_subject,
        date: editBooking.date,
        time: editBooking.time,
        price: editBooking.price,
        revisionSession: editBooking.revisionSession,
        duration: editBooking.duration,
      });
      await tempBooking2.save();    
    }
    
    let formatted_subject = await formatInput(subject);

    editBooking.subject = formatted_subject;
    editBooking.date = bookingStartDateTime;
    editBooking.time = bookingTime;
    editBooking.duration = duration;
    editBooking.price = bookingPrice;
    editBooking.tutorConfirmed = true;
    editBooking.studentConfirmed = false;
    editBooking.revisionSession = (revision === "yes");
    // Save the booking
    await editBooking.save();
    

    res.redirect('/tutor/viewBooking.html?message=Booking edited successfully.&type=success');
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/editBooking.html?message=Failed to edit booking.&type=error');
  }
};

exports.launchLesson = async(req, res) => {
  const {bookingId} = req.body;
  try {
    req.session.bookingID = bookingId;
    const booking = await Booking.findById(req.session.bookingID);
    
    let user = await findUser(req, res, "viewBooking",  booking.tutor._id);
    if(booking.revisionSession){
      user.revisionCount = user.revisionCount+1;
      await user.save();
    }
    if(!booking.zJoinUrl){
      const token = await generateAccessToken();
  
      const meetingData = await createZoomMeeting(token, user.email, booking.revisionSession? 'Revision Session': 'Tutoring Session', booking.time, booking.duration);
      booking.zMeetingId = meetingData.id;
      booking.zMeetingPassword = meetingData.password;
      booking.zJoinUrl = meetingData.join_url;
      await booking.save();
    }

    req.session.zoomLink = booking.zJoinUrl;
    
    return res.redirect('/tutor/lessonNotes.html?zoom=true');

  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/viewBooking.html?message=Failed to join zoom meeting.&type=error');
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
    return res.redirect('/tutor/lessonNotes.html?message=Failed to create zoom meeting.&type=error');
  }
};

exports.launchReport = async(req, res) => {
  const {bookingId} = req.body;
  try {
    req.session.bookingID = bookingId;
    const booking = await Booking.findById(req.session.bookingID);
    return res.redirect('/tutor/lessonNotes.html');
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/viewBooking.html?message=Failed to join zoom meeting.&type=error');
  }
}

exports.lessonReportSubmit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/lessonReport.html?message=Invalid input.&type=error');
  }
  const { topics, successTopics, weakTopics, nextLessonPlan, topicName, deadline, generatedQuestions } = req.body;
  let reportSent = false;
  // Example of how you might handle MongoDB updates
  try {
    const booking = await Booking.findById(req.session.bookingID);
    if (!booking) {
        return res.status(404).send('Booking not found');
    }
    let tutor = await findUser(req, res, "lessonReport", booking.tutor._id);
    tutor.lessonCount = tutor.lessonCount+1;
    await tutor.save();

    // Update booking properties
    booking.notes = [];
    // Assuming topics is a comma-separated string of topics
    booking.notes.push(...topics.split(', ')); 
    booking.successTopics = successTopics;
    booking.weakTopics = weakTopics;
    await booking.save();

    const date = new Date(booking.date);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    let headingTopic = booking.revisionSession ? booking.subject : 'Revision';

    // Find and update related booking for lesson plan
    const relatedBooking = await Booking.findOne({ 
      tutor: booking.tutor, 
      student: booking.student, 
      subject: booking.subject,
      date: { $gt: booking.date },  // Find bookings with a date greater than the current booking date
    }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking

    if (relatedBooking) {
      relatedBooking.plan = nextLessonPlan;
      await relatedBooking.save();
      reportSent = true;
    }
    let messageDesign = `
      <div id = "report" class = "reportStyle">
        <h3>Lesson Report: ${headingTopic} [${day}/${month}/${year}] </h3>
        <p><strong>Topics Covered:</strong></p>
        <ul>
          ${topics.split(', ').map(topic => `<li>${topic}</li>`).join('')}
        </ul>
        <p><strong>Success Topics:</strong></p>
        <ul>
          ${successTopics.split('\n').map(topic => `<li>${topic}</li>`).join('')}
        </ul>
        <p><strong>Weak Topics:</strong></p>
        <ul>
          ${weakTopics.split('\n').map(topic => `<li>${topic}</li>`).join('')}
        </ul>
        <p><strong>Next Lesson Plan:</strong> ${nextLessonPlan}</p>
      </div>
    `;
    let message = new Message({
      sender: booking.tutor,
      receiver: booking.student,
      content: messageDesign,
      fromStudent: false
    });
  
    // Save the message
    await message.save();

    if (topicName === null || deadline===null || !topicName || !deadline){
      return res.redirect('/tutor/viewBooking.html?message=Report complete. Homework not sent &type=success');
    } else {
      let homework = new Homework({
        tutor: booking.tutor._id,
        student: booking.student._id,
        posted: Date.now(),
        topicName: topicName,
        deadline: deadline,
      })
      await homework.save();

      if (generatedQuestions){
        const file = new HomeworkFile({
          homework: homework._id,
          originalname: generatedQuestions,
          isStudent: false,
          isText: true
        });
        await file.save();
      } else if (req.file){

        const file = new HomeworkFile({
          homework: homework._id,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          isStudent: false,
          isText: false
        });
        await file.save();
      }
      
      return res.redirect('/tutor/viewBooking.html?message=Report complete and homework sent.&type=success');
    }
  } catch (error) {
    if (reportSent){
      return res.redirect('/tutor/viewBooking.html?message=Report complete. &type=success');
    }
    console.log(error);
    return res.redirect('/tutor/lessonReport.html?message=Server Error.&type=error');
  }
}

exports.getLessonNotes = async(req, res) => {
  try {
    const booking = await Booking.findById(req.session.bookingID);
    res.json({ notes: booking.notes, subject: booking.subject });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
};

exports.getStudentProfileNotes = async(req, res) => {
  try {
    const booking = await Booking.findById(req.session.bookingID);
    let student = await findUser(req, res, "lessonReport", booking.student._id, true);
    res.json({ 
      f_filename: student.isPictureVerified ? student.f_filename : 'TBC.jpg',
      f_originalname: student.f_originalname,
      date: booking.date, 
      subject: booking.subject,
      studentName: booking.studentName,
    });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
};

exports.newBooking = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/newBooking.html?message=Invalid input.&type=error');
  }
  const { revision, subject, bookingDate, bookingTime, recurring, bookingPrice, duration } = req.body;
  try {
    let recipient = await findUser(req, res, "newBooking", req.session.recipientID, true);
    const bookingStartDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
    const bookingEndDateTime = new Date(bookingStartDateTime.getTime() + duration * 60 * 1000);
    const now = new Date();
    if (bookingStartDateTime < now) {
      return res.redirect('/tutor/newBooking.html?message=Booking time cannot be in the past.&type=error');
    }
    // Check for initial booking conflict
    if (await hasConflictingBooking(req.session.user._id, recipient._id, bookingStartDateTime, bookingEndDateTime, null)) {
      return res.redirect('/tutor/newBooking.html?message=This time slot is not available.&type=error');
    }
    let name = await findUser(req, res, "newBooking", req.session.user._id);
    
    let recurringChoice = (recurring === "Yes");
    let revisionChoice = (revision === "yes");
    const recurringID = uuidv4();
    // Function to create a booking
    let formatted_subject = await formatInput(subject);
    const createBooking = async (startDateTime) => {
      let booking = new Booking({
        tutor: req.session.user._id,
        student: recipient._id,
        tutorName: name.fullName,
        studentName: recipient.fullName,
        subject: formatted_subject, 
        date: startDateTime,
        time: bookingTime,
        duration: duration,
        price: bookingPrice,
        recurringID: recurringChoice ? recurringID : null,
        revisionSession: revisionChoice ? true : false,
      });

      await booking.save();
      // await createBooking.save();
    };

    // Create the initial booking
    await createBooking(bookingStartDateTime);

    // If recurring, create bookings for the next 6 months (approximately 26 weeks)
    if (recurringChoice) {
      for (let i = 1; i <= 26; i++) {
        let nextBookingStartDateTime = new Date(bookingStartDateTime);
        nextBookingStartDateTime.setDate(nextBookingStartDateTime.getDate() + (i * 7));
        
        let nextBookingEndDateTime = new Date(nextBookingStartDateTime.getTime() + 60 * 60 * 1000);

        // Check for conflicts with each recurring booking
        if (!(await hasConflictingBooking(req.session.user._id, recipient._id, nextBookingStartDateTime, nextBookingEndDateTime, null))) {
          await createBooking(nextBookingStartDateTime);
        }
      }
    }

    res.redirect('/tutor/viewMessage.html?message=Booking created successfully.&type=success');
  } catch(error){
    console.error(error);
    return res.redirect('/tutor/newBooking.html?message=Server error.&type=error');
  }
};

exports.lessonNotesSubmit = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/lessonNotes.html?message=Invalid input.&type=error');
  }
  let { topics } = req.body;
  if (typeof topics === 'string') {
    topics = topics.split(',').map(topic => topic.trim()).filter(topic => topic);
  }

  try {
    const bookingID2 = req.session.bookingID;
    const booking = await Booking.findById(bookingID2);

    if (!booking) {
      return res.redirect('/tutor/lessonNotes.html?message=Booking not found.&type=error');
    }

    if (!booking.notes) {
      booking.notes = [];
    }

    topics.forEach(topic => {
      if (topic) {
        booking.notes.push(topic);
      }
    });

    await booking.save();
    res.redirect('/tutor/lessonReport.html?message=Notes added.&type=success');
  } catch (error) {
    console.error('Error saving booking notes:', error);
    res.redirect('/tutor/lessonNotes.html?message=Server error.&type=error');
  }
};