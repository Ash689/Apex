// sessionCheckTutor.js
module.exports = (req, res, next) => {
  console.log(`Session Check Tutor: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.user) {
    console.log("EXPIRED");
    return res.redirect('/tutor/login.html?message=Please logasd in.&type=error');
  } else {
    if (req.session.user.role !== "tutor"){
      console.log("Wrong Role");
      return res.redirect('/tutor/login.html?message=Please lqwsog in.&type=error');
    }
  }
  next(); // Call next() to proceed to the next middleware or route handler
};