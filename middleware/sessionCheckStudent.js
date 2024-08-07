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
  }
  next(); // Call next() to proceed to the next middleware or route handler
};