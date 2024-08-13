
const findUser = require('../../utils/findUser'); // Assuming you have a utility function for this
const { body, validationResult } = require('express-validator');
const Booking = require('../../models/booking');

exports.apiprofile = async (req, res) => {
    const user = await findUser(req, res, "home", req.session.user._id);
    res.json(user);
};

exports.userName = async (req, res) => {
    try {
        let user = await findUser(req, res, "home", req.session.user._id);
        res.json({
            fullName: user.fullName,
            email: user.email,
            subjects: user.subjects
        });
        
    } catch (error) {
        console.error(error);
        return res.redirect('/student/login.html?message=Error, Please log in.&type=error');
    }
};

exports.getID = async (req, res) => {
    try {
        const { recipientEmail } = req.body;
        req.session.recipientID = recipientEmail;
        res.redirect('/student/viewMessage.html');
    } catch(error){
        console.error(error);
        return res.redirect('/student/viewMessage.html?message=Server error.&type=error');
    }
};

exports.viewProfile = async(req, res) => {
    try {
        let user = await findUser(req, res, "viewTutorProfile", req.session.recipientID, true);
        res.json({
            _id: user._id,
            f_originalname: user.f_originalname,
            f_filename: user.isPictureVerified ? user.f_filename : 'TBC.jpg',
            fullName: user.fullName,
            tuitionType: user.tuitionType,
            subjects: user.subjects,
            daysAvailable: user.daysAvailable,
            email: user.email,
            price: user.price,
            reviews: user.reviews,
            reviewCount: user.reviewCount,
            lessonCount: user.lessonCount,
            revisionCount: user.revisionCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }  
};

exports.getTutorProfile = async(req,res) => {
    try {
        let recipient = await findUser(req, res, "findTutor", req.session.recipientID, true);
        res.json(recipient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getTutorProfile2 = async(req, res) => {
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