// sessionCheckStudent.js
module.exports = (req, res, next) => {
  console.log(`Session Check Password Student: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.codeEntered) {
    console.log("EXPIRED");
    return res.redirect('/student/login.html?message=Session expired.&type=error');
  }
  next(); // Call next() to proceed to the next middleware or route handler
};