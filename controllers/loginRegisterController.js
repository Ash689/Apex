const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const tutorUser = require('../models/tutorUser');
const studentUser = require('../models/studentUser');
const Message = require('../models/message');

exports.registerUser = async (req, res, userType) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(`/${userType}/register.html?message=Invalid input.&type=error`);
  }

  const { email, password, repassword } = req.body;

  try {
    const userModel = userType === 'tutor' ? tutorUser : studentUser;
    let user = await userModel.findOne({email: email});
    if (user) {
      return res.redirect(`/${userType}/register.html?message= Account already exists.&type=error`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    user = new userModel({
      email,
      password: hashedPassword,
    });

    await user.save();


    req.session.user = {
      _id: user._id,
      role: userType === "tutor",
    };

    // Redirect based on profile existence
    if (user.town) {
      res.redirect(`/${userType}/home.html`);
    } else {
      res.redirect(`/${userType}/configProfile.html`);
    }
  } catch (error) {
    console.error(error);
    res.redirect(`/${userType}/register.html?message=Server error.&type=error`);
  }
};

exports.loginUser = async (req, res, userType) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(`/${userType}/login.html?message=Invalid input.&type=error`);
  }
  const { email, password } = req.body;
  try {
    const userModel = userType === 'tutor' ? tutorUser : studentUser;
    let user = await userModel.findOne({ email: email });
    if (!user) {
      return res.redirect(`/${userType}/login.html?message=User not found.&type=error`);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.redirect(`/${userType}/login.html?message=Invalid credentials.&type=error`);
    }

    req.session.user = {
      _id: user._id,
      role: userType,
    };

    if (user.town) {
      if (user.subjects.length === 0) {
        res.redirect(`/${userType}/configSubject.html`);
      } else {
        res.redirect(`/${userType}/home.html`);
      }
    } else {
      res.redirect(`/${userType}/configProfile.html`);
    }
  } catch (error) {
    console.error(error);
    res.redirect(`/${userType}/login.html?message=Server error.&type=error`);
  }
};

exports.logout = async (req, res, userType) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return userType === "tutor" 
      ? res.redirect(`/tutor/home.html?message=Failed to log out.&type=error`) 
      : res.redirect(`/student/home.html?message=Failed to log out.&type=error`);
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    return userType === "tutor" 
    ? res.redirect(`/tutor/login.html?message=Successfully logged out.&type=success`) 
    : res.redirect(`/student/login.html?message=Successfully logged out.&type=success`);
  });
};

exports.countMessage = async(req, res) => {
  try {
    const { user } = req.params;

    // Determine the read field based on the `user` parameter
    const readField = user === "t" ? 'tutorRead' : 'studentRead';
    // Count unread messages
    let unreadMessagesCount = await Message.countDocuments({
      receiver: req.session.user._id,
      [readField]: false
    });

    res.json({ count: unreadMessagesCount });
  } catch (error) {
    console.error(error);
    return req.session.user.role === "tutor" 
    ? res.redirect(`/tutor/login.html?message=Please log in .&type=success`) 
    : res.redirect(`/student/login.html?message=Please log in.&type=success`);
  }
};
