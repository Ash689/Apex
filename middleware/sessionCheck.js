// sessionCheck.js
module.exports = (req, res, next) => {
  console.log(`Session Check: Incoming request: ${req.method} ${req.url}`);
  if (!req.session.user) {
    console.log("EXPIRED");
    return res.redirect('/welcome.html?message=Please log in.&type=error');
  }
  next(); // Call next() to proceed to the next middleware or route handler
};