// sessionCheckStudent.js

/*
const studentUser = require('../models/studentUser');
module.exports = (req, res, next) => {
  console.log(`Session Check Student: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.user) {
    console.log("EXPIRED");
    return res.redirect('/student/login.html?message=Please log in.&type=error');
  } else {
    if (req.session.user.role !== "student"){
      console.log("Wrong Role");
      return res.redirect('/student/login.html?message=Please log in.&type=error');
    } else {
      let user = studentUser.findById(req.session.user._id);
      if (!user.isEmailVerified){
        console.log("Not email verified");
        return res.redirect('/student/verifyEmail.html?message=Email verification sent, please enter the code below &type=success');
      } else{
        if (user.town) {
          if (user.subjects.length === 0) {
            res.redirect(`/student/configSubject.html`);
          } else {
            res.redirect(`/student/home.html`);
          }
        } else {
          res.redirect(`/student/configProfile.html`);
        }
      }
    }
  }
  next(); // Call next() to proceed to the next middleware or route handler
};

*/

// sessionCheckTutor.js
module.exports = (req, res, next) => {
  console.log(`Session Check Student: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.user) {
    console.log("EXPIRED");
    return res.redirect('/student/login.html?message=Please log in.&type=error');
  } else {
    if (req.session.user.role !== "student"){
      console.log("Wrong Role");
      return res.redirect('/student/login.html?message=Please log in.&type=error');
    }
  }
  next(); // Call next() to proceed to the next middleware or route handler
};