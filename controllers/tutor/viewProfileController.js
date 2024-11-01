
const findUser = require('../../utils/findUser');
const Booking = require('../../models/booking');
const { body, validationResult } = require('express-validator');
const validationStandard = require('../../utils/validationComplete');
const alreadyValid = require('../../utils/alreadyValidated');


exports.apiprofile = async (req, res) => {
  try {
    const user = await findUser(req, res, "home", req.session.user._id);
    res.json(user);
  } catch (error) {
    console.error('Error in apiprofile:', error);
    return res.redirect('/tutor/home.html?message=Server error.&type=error');
  }
};

exports.userName = async (req, res) => {
    try {
      let user = await findUser(req, res, "home", req.session.user._id);
      res.json({
        fullName: user.fullName,
        email: user.email,
        price: user.price,
        lessonCount: user.lessonCount,
        subjects: user.subjects
      });
      
    } catch (error) {
        console.error(error);
        return res.redirect('/tutor/login.html?message=Error, Please log in.&type=error');
    }
};

exports.getID = async (req, res) => {
  const { recipientEmail } = req.body;
  req.session.recipientID = recipientEmail;
  res.redirect('/tutor/viewMessage.html');
};

exports.alreadyValidated = async(req, res) => {

  const { page } = req.body;
  res.json({
    pageAvailable: await alreadyValid(req.session.user._id, "tutor", page)
  }) 
}

exports.validationComplete = async(req, res) => {

  res.json({
    redirectUrl: await validationStandard(req.session.user._id, "tutor")
  }) 
}

exports.getBookingProfile = async(req,res) => {
    
  try {
    let recipient = await findUser(req, res, "viewMessage", req.session.recipientID, true);

    // Find and update related booking for lesson plan
    const relatedBooking = await Booking.findOne({ 
      tutor: req.session.user._id, 
      student: recipient._id,
      date: { $gt: new Date() },
      cancelled: false,
    }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking
    res.json({
      recipient: recipient,
      lesson: relatedBooking ? relatedBooking: ""
    });
  
  } catch(error){
      console.error(error);
      return res.redirect('/tutor/viewMessage.html?message=Server error.&type=error');
  }
};