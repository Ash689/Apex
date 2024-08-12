// sessionCheckStudent.js
const studentUser = require('../models/studentUser');
module.exports = (req, res, next) => {
  console.log(`Session Check Verify Student: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.user) {
    console.log("EXPIRED");
    return res.redirect('/student/login.html?message=Session expired.&type=error');
  } else {
    let user = studentUser.findById(req.session.user._id);
    if(user.isEmailVerified){
      console.log("Email verified");
      return res.redirect('/student/home.html');
    }
  }
  next(); // Call next() to proceed to the next middleware or route handler
};