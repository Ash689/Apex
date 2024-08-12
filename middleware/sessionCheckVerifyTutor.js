// sessionCheckStudent.js
const tutorUser = require('../models/tutorUser');
module.exports = (req, res, next) => {
  console.log(`Session Check Verify Tutor: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.user) {
    console.log("EXPIRED");
    return res.redirect('/tutor/login.html?message=Session expired.&type=error');
  } else {
    let user = tutorUser.findById(req.session.user._id);
    if(user.isEmailVerified){
      return res.redirect('/tutor/home.html');
    }
  }
  next(); // Call next() to proceed to the next middleware or route handler
};