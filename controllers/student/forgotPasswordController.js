const { body, validationResult } = require('express-validator');
const studentUser = require('../../models/studentUser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function generate8DigitToken() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.redirect('/student/forgotPassword.html?message=Invalid input.&type=error');
  }

  const { email } = req.body;

  try {

      let user = await studentUser.findOne({email: email});
      if(user){
        const token = generate8DigitToken();
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();
        req.session.email = email;
      }
  } catch (error) {
      console.error("Error saving profile: ", error);
      res.redirect('/student/forgotPassword.html?message=Server error.&type=error');
  }
};

exports.codeEntry = async (req, res) => {

  const { code } = req.body;

  try {

      let user = await studentUser.findOne({email: req.session.email});
      if(user){
        if (user.passwordToken === code){
          req.session.codeEntered = true;
          res.redirect('/student/newPassword.html?message=Code valid, please enter new password.&type=success');
        }
      } else {
        res.redirect('/student/forgotPassword.html?message=Invalid code, please enter new password.&type=error');
      }
  } catch (error) {
      console.error("Error saving profile: ", error);
      res.redirect('/student/forgotPassword.html?message=Server error.&type=error');
  }
};

exports.changePassword = async (req, res) => {

  const { password } = req.body;

  try {

      let user = await studentUser.findOne({email: req.session.email});
      if(user){
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        await user.save();
        res.redirect('/student/login.html?message=Password changed successfully.&type=success');
      }
  } catch (error) {
      console.error("Error saving profile: ", error);
      res.redirect('/student/newPassword.html?message=Server error.&type=error');
  }
};

exports.getEmail = async (req, res) => {
  try{
    res.json({email: req.session.email});
  } catch (error) {
      console.error("Error saving profile: ", error);
      res.redirect('/student/newPassword.html?message=Server error.&type=error');
  }
};