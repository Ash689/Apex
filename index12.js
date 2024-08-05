require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');
const MongoDBStore = require('connect-mongodb-session')(session);
const sessionCheckStudent = require('./middleware/sessionCheckStudent');
const sessionCheckTutor = require('./middleware/sessionCheckTutor');
const sessionCheck = require('./middleware/sessionCheck');

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


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
    maxAge: 60 * 60 * 10
  }
}));

app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.get('/', (req, res) => {
  res.redirect('/welcome.html');
});


// Middleware to serve static files
app.use('/uploads', express.static('uploads'));

app.use('/student', require('./routes/student/bookingRoutes'));
app.use('/student', require('./routes/student/editDetailRoutes'));
app.use('/student', require('./routes/student/findTutorRoutes'));
app.use('/student', require('./routes/student/homeworkRoutes'));
app.use('/student', require('./routes/student/messageRoutes'));
app.use('/student', require('./routes/student/viewProfileRoutes'));

app.use('/tutor', require('./routes/tutor/bookingRoutes'));
app.use('/tutor', require('./routes/tutor/editDetailRoutes'));
app.use('/tutor', require('./routes/tutor/homeworkRoutes'));
app.use('/tutor', require('./routes/tutor/messageRoutes'));
app.use('/tutor', require('./routes/tutor/viewProfileRoutes'));


app.use('/', require('./routes/entryRoutes'));
app.use('/', require('./routes/bookingRoutes'));


app.use('/uploads', express.static('uploads'));


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

