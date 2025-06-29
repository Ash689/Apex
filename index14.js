require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const MongoDBStore = require('connect-mongodb-session')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const offSessionPayment = require('./utils/offSessionPayment');
const getLessonsScheduledIn24Hours = require('./utils/getLessonsScheduledin24Hours');
// const csrf = require('csrf');

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {});
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 60 * 60 * 1000 * 2,
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  }
}));

app.use(express.static(path.join(__dirname, 'public')));

//----------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600
});
app.use(limiter);

app.use(helmet());

// const csrfProtection = csrf({ cookie: true }); // Initialize csrf protection

// // Apply CSRF protection middleware
// app.use(csrfProtection);

// // Middleware to set CSRF token for every response
// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });

//------------

// Routes
app.get('/', (req, res) => {
  res.redirect('/welcome.html');
});


// Middleware to serve static files
app.use('/uploads', express.static('uploads'));


app.use('/', require('./routes/entryRoutes'));


app.use('/student', require('./routes/student/forgotPasswordRoutes'));
app.use('/student', require('./routes/student/bookingRoutes'));
app.use('/student', require('./routes/student/editDetailRoutes'));
app.use('/student', require('./routes/student/findTutorRoutes'));
app.use('/student', require('./routes/student/homeworkRoutes'));
app.use('/student', require('./routes/student/messageRoutes'));
app.use('/student', require('./routes/student/viewProfileRoutes'));

app.use('/tutor', require('./routes/tutor/forgotPasswordRoutes'));
app.use('/tutor', require('./routes/tutor/bookingRoutes'));
app.use('/tutor', require('./routes/tutor/editDetailRoutes'));
app.use('/tutor', require('./routes/tutor/homeworkRoutes'));
app.use('/tutor', require('./routes/tutor/messageRoutes'));
app.use('/tutor', require('./routes/tutor/viewProfileRoutes'));

app.use('/', require('./routes/bookingRoutes'));

cron.schedule('0 * * * *', async () => {
  try {
    const bookings = await getLessonsScheduledIn24Hours(); // Custom function to fetch relevant lessons

    for (let booking of bookings) {
      await offSessionPayment(booking._id);
    }
  } catch (error) {
    console.error('Error scheduling payment:', error);
  }
});

app.use('/uploads', express.static('uploads'));


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

