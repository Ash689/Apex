const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const tutorUser = require('../models/tutorUser');
const studentUser = require('../models/studentUser');
const Message = require('../models/message');
require('dotenv').config();
const formatInput = require('../utils/formatInput');

exports.registerUser = async (req, res, userType) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect(`/${userType}/register.html?message=Invalid input.&type=error`);
  }

  const { email, password} = req.body;

  try {
    const userModel = userType === 'tutor' ? tutorUser : studentUser;
    let formattedEmail = await formatInput(email);
    let user = await userModel.findOne({email: formattedEmail});
    if (user) {
      return res.redirect(`/${userType}/register.html?message= Account already exists.&type=error`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
    // Create new user
    user = new userModel({
      email: formattedEmail,
      password: hashedPassword,
    });

    await user.save();

    req.session.user = {
      _id: user._id,
      role: userType
    };

    res.redirect(`/${userType}/sendVerification`);

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
    let formattedEmail = await formatInput(email);
    let user = await userModel.findOne({ email: formattedEmail });
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
    if (!user.isEmailVerified){
      res.redirect(`/${userType}/sendVerification`);
    } else {
      if (user.postcode) {
        if (!user.isIDVerified){
          res.redirect(`/${userType}/verifyID.html`);
        } else {
          // if (userType === 'tutor' && !user.stripeAccount){
          //   res.redirect(`/tutor/configBanking.html`);
          // } else {
            if (user.subjects.length === 0) {
              res.redirect(`/${userType}/configSubject.html`);
            } else {
              res.redirect(`/${userType}/home.html`);
            }
          // }
        }
      } else {
        res.redirect(`/${userType}/configProfile.html`);
      }
      
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
