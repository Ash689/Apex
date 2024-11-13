const { body, validationResult } = require('express-validator');
const studentUser = require('../../models/studentUser');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateToken = require('../../utils/generateToken'); 
const {sendResetEmail, sendVerifyEmail} = require('../../utils/email/verifyEmail');
require('dotenv').config();

const formatInput = require('../../utils/formatInput');


exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/student/forgotPassword.html?message=Invalid input.&type=error');
  }

  const { email } = req.body;

  try {
    let formattedEmail = await formatInput(email);

    let user = await studentUser.findOne({email: formattedEmail});
    if(user){
      const token = generateToken();
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 60*15*10000;
      await user.save();
      req.session.email = user.email;
      await sendResetEmail(user.email, token);
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
        if (Date.now() < user.resetPasswordExpires){
          req.session.codeEntered = true;
          user.resetPasswordToken = null;
          user.resetPasswordExpires = null;
          res.redirect('/student/newPassword.html?message=Code valid, please enter new password.&type=success');
        } else {
          user.resetPasswordToken = null;
          user.resetPasswordExpires = null;
          await user.save();
          res.redirect(`/student/login.html?message=Code expired, please enter new one.&type=error`);
        }

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

exports.getEmailReset = async (req, res) => {
  try{
    res.json({email: req.session.email});
  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/student/login.html?message=Error, please log in.&type=error');
  }
};

exports.getEmailVerify = async (req, res) => {
  try{
    let user = await studentUser.findById(req.session.user._id);
    res.json({email: user.email});
  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/student/login.html?message=Error, please log in.&type=error');
  }
};

exports.sendVerification = async (req, res) => {
  try {
    let user = await studentUser.findById(req.session.user._id);
    if(user){
      const token = generateToken();
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 60*15*10000;
      await user.save();
      await sendVerifyEmail(user.email, token);
    }
    res.redirect('/student/verifyEmail.html?message=Email verification sent, please enter the code below.&type=success');

  } catch (error) {
    console.error("Error verifying profile: ", error);
    res.redirect('/student/verifyEmail.html?message=Server error.&type=error');
  }
};

exports.verify = async (req, res) => {

  const { code } = req.body;
  try {
    let user = await studentUser.findById(req.session.user._id);
    if(user){
      if (user.resetPasswordToken === code){
        if (Date.now() < user.resetPasswordExpires){
          user.resetPasswordToken = null;
          user.resetPasswordExpires = null;
          user.isEmailVerified = true;
          await user.save();
          res.redirect('/student/configProfile.html?message=Code valid!&type=success');
        } else {
          user.resetPasswordToken = null;
          user.resetPasswordExpires = null;
          await user.save();
          res.redirect(`/student/verifyEmail.html?message=Code expired, please enter new one.&type=error`);
        }
      } else {
        res.redirect('/student/verifyEmail.html?message=Invalid code, please try again.&type=error');
      }
    } else {
      res.redirect('/student/verifyEmail.html?message=Invalid code, please try again.&type=error');
    }
  } catch (error) {
      console.error("Error saving profile: ", error);
      res.redirect('/student/verifyEmail.html?message=Server error.&type=error');
  }
};