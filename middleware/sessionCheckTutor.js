// sessionCheckTutor.js
module.exports = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/tutor/login.html?message=Please log in.&type=error');
    }
    next(); // Call next() to proceed to the next middleware or route handler
};