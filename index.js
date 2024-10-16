require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const MongoDBStore = require('connect-mongodb-session')(session);

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const csrf = require('csrf');

const app = express();
const PORT = process.env.PORT;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = (process.env.MONGODB_URI || '').trim();

console.log(`alskdjaskld + ${uri}`);

console.log(`1jl2k3j + ${process.env.MONGODB_URI}`);
// Improved connection with additional options and better error handling
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,  // Timeout after 5 seconds if no server is found
  connectTimeoutMS: 10000,         // Timeout after 10 seconds for the initial connection
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Optionally handle any connection failures (e.g., graceful app shutdown)
    process.exit(1);  // Exit the process if connection fails (optional)
  });

// Use the same trimmed URI for session store to avoid repeating process.env
const store = new MongoDBStore({
  uri,  // Reuse the trimmed and validated URI
  collection: 'sessions',
});

// Handle MongoDBStore connection errors
store.on('error', function(error) {
  console.error('Session store error:', error);
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    maxAge: 60 * 60 * 1000 * 24,
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


app.use('/uploads', express.static('uploads'));


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on ${process.env.URL}/${PORT}`);
});

