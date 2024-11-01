// sessionCheckStudent.js

/*
// sessionCheckStudent.js
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

    if (!req.session.user.isEmailVerified){
      return res.redirect(`/student/sendVerification`);
    }
    if (req.session.user.postcode) {
      if (!req.session.user.isIDVerified){
        return res.redirect(`/student/verifyID.html`);
      } else {
        if (req.session.user.subjects.length === 0) {
          return res.redirect(`/student/configSubject.html`);
        } else {
          return res.redirect(`/student/home.html`);
        }
        i
      }
    }
    return res.redirect(`/student/configProfile.html`);
    
  }
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