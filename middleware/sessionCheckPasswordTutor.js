// sessionCheckStudent.js
module.exports = (req, res, next) => {
  console.log(`Session Check Tutor: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.email || !req.session.token) {
    console.log("EXPIRED");
    return res.redirect('/tutor/login.html?message=Session expired.&type=error');
  }
  next(); // Call next() to proceed to the next middleware or route handler
};