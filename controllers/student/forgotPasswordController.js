const { body, validationResult } = require('express-validator');
const studentUser = require('../../models/studentUser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();
const nodemailer = require('nodemailer');

function generate8DigitToken() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendResetEmail(userEmail, token) {
  const mailOptions = {
    from: process.env.EMAIL, // Replace with your email
    to: userEmail,
    subject: 'Password Reset',
    text: `Your password reset token is ${token}. It will expire in 15 mins.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
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
      user.resetPasswordExpires = Date.now() + 60*15*10000; // 1 hour
      await user.save();
      req.session.email = email;
      console.log(token);
      // await sendResetEmail(email, token);
    }
    res.json({ success: true });

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
      if (user.resetPasswordToken === code){
        req.session.codeEntered = true;
        res.redirect('/student/newPassword.html?message=Code valid, please enter new password.&type=success');
      } else {
        res.redirect('/student/forgotPassword.html?message=Invalid code, please try again.&type=error');

      }
    } else {
      res.redirect('/student/forgotPassword.html?message=Invalid code, please try again.&type=error');
    }
  } catch (error) {
      console.error("Error saving profile: ", error);
      res.redirect('/student/forgotPassword.html?message=Server error.&type=error');
  }
};

exports.changePassword = async (req, res) => {

  const { password } = req.body;

  try {
    let message = "Password changed successfully"; let type = 'success';
    let user = await studentUser.findOne({email: req.session.email});
    if(user){
      if (Date.now() < user.resetPasswordExpires){
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT));
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        res.redirect(`/student/login.html?message=Password updated successfully&type=success`);
      } else {
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        res.redirect(`/student/login.html?message=Code expired, please enter new one.&type=error`);
      }
    } else {
      res.redirect('/student/login.html?message=System error, please try again.&type=error');
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