require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const MongoDBStore = require('connect-mongodb-session')(session);
const studentUser = require('./models/studentUser');
const tutorUser = require('./models/tutorUser');
const Message = require('./models/message');
const Booking = require('./models/booking');
const tempBookingData = require('./models/tempBookingData');
const HomeworkFile = require('./models/homeworkFile');
const sessionCheckStudent = require('./public/script/sessionCheckStudent');
const sessionCheckTutor = require('./public/script/sessionCheckTutor');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const axios = require('axios');
const qs = require('querystring');

const Homework = require('./models/homework');

const app = express();
const PORT = process.env.PORT || 3000;
let recipientSendEmail = '';
let bookingID = '';
let homeworkID = '';
let findTutorID = '';
// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY, // Replace with your actual API key
});

const clientId = process.env.ZOOM_CLIENTID;
const clientSecret = process.env.ZOOM_CLIENTSECRET;
const accountId = process.env.ZOOM_ACCOUNTID;

// Session store
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
    maxAge: 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));



async function findUser(req, res, webName, isStudent, para, isId = true) {
  let targetPagePath;
  let user;
  try {
    if(isStudent){
      if(isId){
        user = await studentUser.findById(para);
      } else {
        user = await studentUser.findOne({email: para});
      }
    } else{
      if(isId){
        user = await tutorUser.findById(para);
      } else {
        user = await tutorUser.findOne({email: para});
      }
    }
    if (!user) {
      targetPagePath = `/${webName}.html?message=User not found.&type=error`;
      res.redirect(targetPagePath);
      return null; // Return null to indicate user not found
    }
    return user;
  } catch (error) {
    console.error(error);
    targetPagePath = `/${webName}.html?message=Server error.&type=error`;
    res.redirect(targetPagePath);
    return null; // Return null to indicate a server error
  }
}

function validateDateOfBirth(dateOfBirth, minAgeInput) {
  const minAge = minAgeInput;
  const maxAge = 100;
  const dob = new Date(dateOfBirth);
  const now = new Date();

  if (isNaN(dob.getTime())) {
    return 'Invalid date format.';
  }
  if (dob > now) {
    return 'Date of birth cannot be in the future.';
  }

  const age = now.getFullYear() - dob.getFullYear();
  const monthDifference = now.getMonth() - dob.getMonth();
  const dayDifference = now.getDate() - dob.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  if (age < minAge) {
    return 'You must be at least 18 years old.';
  }
  if (age > maxAge) {
    return 'Age must be less than 100 years old.';
  }

  return null; // No error
}

// Function to check for conflicting bookings
async function hasConflictingBooking(tutorID, studentID, startDateTime, endDateTime, bookID){
  return await Booking.findOne({
    _id: { $ne: bookID? bookID: null },
    $or: [
        {
            tutor: tutorID,
            $expr: {
                $and: [
                    { $lt: ["$date", endDateTime] }, // Booking start time is before the new booking end time
                    { $gt: [{ $add: ["$date", { $multiply: ["$duration", 60 * 1000] }] }, startDateTime] } // Booking end time is after the new booking start time
                ]
            }
        },
        {
            student: studentID,
            $expr: {
                $and: [
                    { $lt: ["$date", endDateTime] }, // Booking start time is before the new booking end time
                    { $gt: [{ $add: ["$date", { $multiply: ["$duration", 60 * 1000] }] }, startDateTime] } // Booking end time is after the new booking start time
                ]
            }
        }
    ]
  });
};

// Routes
app.get('/', (req, res) => {
  res.redirect('/welcome.html');

});

app.get('/student/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect('/studentHome.html?message=Failed to log out.&type=error');
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/loginStudent.html?message=Successfully logged out.&type=success');
  });
});

app.get('/tutor/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect('/tutorHome.html?message=Failed to log out.&type=error');
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/loginTutor.html?message=Successfully logged out.&type=success');
  });
});


// Registration route
app.post('/student/registerStudent', [
  body('email').trim().escape(), 
  body('password').trim().escape(), 
  body('repassword').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/registerStudent.html?message=Invalid input.&type=error');
  }

  const { email, password, repassword } = req.body;

  try {
    let user = await studentUser.findOne({email: email});
    if (user) {
      return res.redirect('/registerStudent.html?message=Student already exists.&type=error');
    }

    if (password !== repassword){
      return res.redirect('/registerStudent.html?message=Passwords do not match.&type=error');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    user = new studentUser({
      email,
      password: hashedPassword,
    });

    await user.save();

    req.session.user = user;

    // Redirect based on profile existence
    if (user.town) {
      res.redirect('/studentHome.html');
    } else {
      res.redirect('/configStudent.html');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/registerStudent.html?message=Server error.&type=error');
  }
});

// Login route
app.post('/student/loginStudent', [
  body('email').trim().escape(),
  body('password').trim().escape(),
  ], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/loginStudent.html?message=Invalid input.&type=error');
  }
  const { email, password } = req.body;
  try {
    // Check if user exists
    
    let user = await studentUser.findOne({email: email});
    if (!user) {
      return res.redirect('/loginStudent.html?message=Student not found.&type=error');
    }
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.redirect('/loginStudent.html?message=Invalid credentials.&type=error');
    }

    // Set session
    req.session.user = user;

    if (user.town) {
      if(user.subjects.length === 0){
        res.redirect('/configStudentSubject.html');
      } else{
        res.redirect('/studentHome.html')
      }
    } else {
      res.redirect('/configStudent.html');
    }
    // if (user.town) {
    //   res.redirect('/studentHome.html');
    // } else {
    //   res.redirect('/configStudent.html');
    // }
  } catch (error) {
    console.error(error);
    res.redirect('/loginStudent.html?message=Server error.&type=error');
  }
});

const storageStudentPicture = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profileFiles/student');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

let upload = multer({ storage: storageStudentPicture, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

// Middleware to serve static files
app.use('/uploads', express.static('uploads'));

app.post('/student/configStudent', sessionCheckStudent, upload.single('profile-photo'), [
  body('fullName').trim().escape(),
  body('town').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/configStudent.html?message=Invalid input.&type=error');
  }

  const {fullName, dateOfBirth, town} = req.body;

  try {

    const dobError = validateDateOfBirth(dateOfBirth, 6);
    if (dobError) {
      return res.redirect(`/configStudent.html?message=${encodeURIComponent(dobError)}&type=error`);
    }

    let user = await findUser(req, res, "configStudent", true, req.session.user._id);

    // Update the necessary fields
    user.fullName = fullName.trim();
    user.dateOfBirth = dateOfBirth;
    user.town = town.trim();
    user.f_filename = req.file.filename,
    user.f_originalname = req.file.originalname,
    user.f_mimetype =  req.file.mimetype,
    user.f_size = req.file.size,

    // Save the updated user
    await user.save();


    res.redirect('/configStudentSubject.html');
  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/configStudent.html?message=Server error.&type=error');
  }
});

app.post('/student/addSubject', sessionCheckStudent, [
    body('subject').trim().escape(),
    body('qualification').trim().escape(),
    body('expectedGrade').trim().escape(),
    body('desiredGrade').trim().escape(),
    body('learningApproach').trim().escape(),
    body('examBoard').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/configStudentSubject.html?message=Invalid input.&type=error');
  }

  const {subject, qualification, expectedGrade, desiredGrade, learningApproach, examBoard } = req.body;

  try {
    let user = await findUser(req, res, "configStudentSubject", true, req.session.user._id);

    // Check if the subject with the same qualification already exists
    let subjectExists = user.subjects.some(subj => 
      subj.subject.trim().toLowerCase() === subject.trim().toLowerCase() &&
      subj.qualification.trim().toLowerCase() === qualification.trim().toLowerCase()
    );

    if (subjectExists) {
      return res.redirect('/configStudentSubject.html?message=Subject with this qualification already exists.&type=error');
    }

    let newSubject = {
      subject: subject,
      expectedGrade: expectedGrade,
      desiredGrade: desiredGrade,
      learningApproach: learningApproach,
      examBoard: examBoard,
      qualification: qualification
    }

    user.subjects.push(newSubject);
    await user.save();

    res.redirect('/configStudentSubject.html?message=Subject added successfully.&type=success');
  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/configStudentSubject.html?message=Server error.&type=error');
  }
});

app.post('/student/continueSubject', sessionCheckStudent, async (req, res) => {
  try {
    let user = await findUser(req, res, "configStudentSubject", true, req.session.user._id);

    if (user.subjects.length === 0) {
      res.redirect('/configStudentSubject.html?message=There needs to be at least one subject.&type=error');
    } else {
      res.redirect('/studentHome.html');
    }

  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/configStudentSubject.html?message=Server error.&type=error');
  }
});

app.post('/student/cancelSubject', sessionCheckStudent, async (req, res) => {

  const {subject} = req.body;

  try {
    let user = await findUser(req, res, "configStudentSubject", true, req.session.user._id);

    const subjectIndex = user.subjects.findIndex(subj => subj.subject === subject);

    if (subjectIndex !== -1) {
      // Remove the subject from the array
      user.subjects.splice(subjectIndex, 1);
      await user.save();
      res.redirect('/configStudentSubject.html?message=Subject removed successfully.&type=success');
    } else {
      res.redirect('/configStudentSubject.html?message=Subject not found.&type=error');
    }

  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/configStudentSubject.html?message=Server error.&type=error');
  }
});

app.post('/student/changePic', sessionCheckStudent, upload.single('profile-photo'), async (req, res) => {
  try {
    
    let user = await findUser(req, res, "studentHome", true, req.session.user._id);

    // Update the necessary fields
    user.f_filename = req.file.filename,
    user.f_originalname = req.file.originalname,
    user.f_mimetype =  req.file.mimetype,
    user.f_size = req.file.size,

    // Save the updated user
    await user.save();


    res.redirect('/studentHome.html?message=Profile updated successfully.&type=success');
  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/studentHome.html?message=Server error.&type=error');
  }
});


// Registration route
app.post('/tutor/registerTutor', [
    body('email').trim().escape(),
    body('password').trim().escape(),
    body('repassword').trim().escape(),
  ],async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/registerTutor.html?message=Invalid input.&type=error');
  }
  const { email, password, repassword } = req.body;

  try {
    // Check if user already exists
    let user = await tutorUser.findOne({email: email});
    if (user) {
      return res.redirect('/registerTutor.html?message=Tutor already exists.&type=error');
    }

    if (password !== repassword){
      return res.redirect('/registerTutor.html?message=Passwords do not match.&type=error');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    user = new tutorUser({
      email,
      password: hashedPassword,
    });

    await user.save();
    req.session.user = user;

    // Redirect based on profile existence
    if (user.town) {
      res.redirect('/tutorHome.html');
    } else {
      res.redirect('/configTutor.html');
    }
  } catch (error) {
    console.error(error);
    res.redirect('/registerTutor.html?message=Server error.&type=error');
  }
});


app.post('/tutor/loginTutor', [
    body('email').trim().escape(),
    body('password').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/loginTutor.html?message=Invalid input.&type=error');
  }
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await tutorUser.findOne({email: email});
    if (!user) {
      return res.redirect('/loginTutor.html?message=Tutor not found.&type=error');
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.redirect('/loginTutor.html?message=Invalid credentials.&type=error');
    }

    // Set session
    req.session.user = user;

    if (user.town) {
      if(user.subjects.length === 0){
        res.redirect('/configTutorSubject.html');
      } else {
        if (user.daysAvailable.length === 0){
          res.redirect('/configTutorDays.html');
        } else {
          res.redirect('/tutorHome.html');
        }
      }
    } else {
      res.redirect('/configTutor.html');
    }
    // if (user.town) {
    //   res.redirect('/tutorHome.html');
    // } else {
    //   res.redirect('/configTutor.html');
    // }
  } catch (error) {
    console.error(error);
    res.redirect('/loginTutor.html?message=Server error.&type=error');
  }
});

const storageTutorPicture = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profileFiles/tutor');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageTutorPicture, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

// Middleware to serve static files
app.use('/uploads', express.static('uploads'));


app.post('/tutor/configTutor', sessionCheckTutor, upload.single('profile-photo'), async (req, res) => {
  
  const {
    fullName,
    dateOfBirth,
    town,
    tuitionType
  } = req.body;

  try{

    const dobError = validateDateOfBirth(dateOfBirth, 18);
    if (dobError) {
      return res.redirect(`/configTutor.html?message=${encodeURIComponent(dobError)}&type=error`);
    }

    // Create new profile
    // let user = await tutorUser.findById(req.session.user._id);
    let user = await findUser(req, res, "configTutor", false, req.session.user._id);

    // Update the necessary fields
    user.fullName = fullName.trim();
    user.dateOfBirth = dateOfBirth;
    user.town = town.trim();
    user.tuitionType = tuitionType.trim();
    user.f_filename = req.file.filename,
    user.f_originalname = req.file.originalname,
    user.f_mimetype =  req.file.mimetype,
    user.f_size = req.file.size,

    // Save the updated user
    await user.save();

    res.redirect('/configTutorSubject.html');
  } catch (error){
    console.error(error);
    res.redirect('/configTutor.html?message=Server error.&type=error');
  
  }
});

app.post('/tutor/addSubject', sessionCheckTutor, [
    body('subject').trim().escape(),
    body('qualification').trim().escape(),
    body('grade').trim().escape(),
    body('teachingApproach').trim().escape(),
    body('examBoard').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/configTutorSubject.html?message=Invalid input.&type=error');
  }

  const {subject, qualification, grade, teachingApproach, examBoard } = req.body;

  try {
    let user = await findUser(req, res, "configTutorSubject", false, req.session.user._id);

    // Check if the subject with the same qualification already exists
    let subjectExists = user.subjects.some(subj => 
      subj.subject.trim().toLowerCase() === subject.trim().toLowerCase() &&
      subj.qualification.trim().toLowerCase() === qualification.trim().toLowerCase()
    );

    if (subjectExists) {
      return res.redirect('/configTutorSubject.html?message=Subject with this qualification already exists.&type=error');
    }

    let newSubject = {
      subject: subject,
      grade: grade,
      learningApproach: teachingApproach,
      examBoard: examBoard,
      qualification: qualification
    }

    user.subjects.push(newSubject);
    await user.save();

    res.redirect('/configTutorSubject.html?message=Subject added successfully.&type=success');
  } catch (error) {
    console.error(error);
    res.redirect('/configTutorSubject.html?message=Server error.&type=error');
  }
});

app.post('/tutor/cancelSubject', sessionCheckTutor, async (req, res) => {
  const { subject } = req.body;

  try {
    let user = await findUser(req, res, "configTutorSubject", false, req.session.user._id);

    const subjectIndex = user.subjects.findIndex(subj => subj.subject === subject);

    if (subjectIndex !== -1) {
      // Remove the subject from the array
      user.subjects.splice(subjectIndex, 1);
      await user.save();
      res.redirect('/configTutorSubject.html?message=Subject removed successfully.&type=success');
    } else {
      res.redirect('/configTutorSubject.html?message=Subject not found.&type=error');
    }

  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/configTutorSubject.html?message=Server error.&type=error');
  }
});

app.post('/tutor/continueSubject', sessionCheckTutor, async (req, res) => {
  try {
    let user = await findUser(req, res, "configTutorSubject", false, req.session.user._id);

    if (user.subjects.length === 0) {
      res.redirect('/configTutorSubject.html?message=There needs to be at least one subject.&type=error');
    } else {
      if (user.daysAvailable.length === 0){
        res.redirect('/configTutorDays.html');
      } else {
        res.redirect('/tutorHome.html');
      }
    }

  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/configTutorSubject.html?message=Server error.&type=error');
  }
});


app.post('/tutor/addDays', sessionCheckTutor, async (req, res) => {
  const { daysAvailable } = req.body;

  try {
    let user = await findUser(req, res, "configTutorDays", false, req.session.user._id);

    if (!daysAvailable) {
      res.redirect('/configTutorDays.html?message=You must pick at least one day.&type=error');
      return;
    }

    // Split the comma-separated string into an array of days
    const newDays = daysAvailable.split(',');

    // Clear existing daysAvailable array and add new days
    user.daysAvailable = newDays.map(day => ({ day }));

    // Save the updated user object
    await user.save();

    // Redirect to tutor home page after successfully adding days
    res.redirect('/tutorHome.html');

  } catch (error) {
    console.error(error);
    res.redirect('/configTutorDays.html?message=Server error.&type=error');
  }
});



app.post('/tutor/changePic', sessionCheckTutor, upload.single('profile-photo'), async (req, res) => {

  let user = await findUser(req, res, "tutorHome", false, req.session.user._id);

  // Update the necessary fields
  user.f_filename = req.file.filename,
  user.f_originalname = req.file.originalname,
  user.f_mimetype =  req.file.mimetype,
  user.f_size = req.file.size,

  // Save the updated user
  await user.save();
  res.redirect('/tutorHome.html?message=Profile updated successfully.&type=success');
});

app.post('/tutor/changePrice', sessionCheckTutor, async (req, res) => {
  const { newPrice } = req.body;

  // Validate the new price
  if (newPrice <= 0) {
    return res.redirect('/tutorHome.html?message=Price must be greater than 0.&type=error');
  }

  try {
    let user = await findUser(req, res, "tutorHome", false, req.session.user._id);

    // Update the necessary fields
    user.price = newPrice;

    // Save the updated user
    await user.save();

    res.redirect('/tutorHome.html?message=Profile updated successfully.&type=success');
  } catch (error) {
    res.redirect('/tutorHome.html?message=Error updating profile.&type=error');
  }
});

app.post('/tutor/changetuitionType', sessionCheckTutor, async (req, res) => {
  const { newTuitionType } = req.body;

  try {
    let user = await findUser(req, res, "tutorHome", false, req.session.user._id);

    // Update the necessary fields
    user.tuitionType = newTuitionType;

    // Save the updated user
    await user.save();

    res.redirect('/tutorHome.html?message=Profile updated successfully.&type=success');
  } catch (error) {
    res.redirect('/tutorHome.html?message=Error updating profile.&type=error');
  }
});

app.post('/tutor/changeAvailability', sessionCheckTutor, async (req, res) => {

  try {
    let user = await findUser(req, res, "tutorHome", false, req.session.user._id);

    // Update the necessary fields
    user.isAvailable = !user.isAvailable;

    // Save the updated user
    await user.save();

    res.redirect('/tutorHome.html?message=Profile updated successfully.&type=success');
  } catch (error) {
    res.redirect('/tutorHome.html?message=Error updating profile.&type=error');
  }
});





app.get('/findTutors', sessionCheckStudent, async (req, res) => {
  try {
      // Fetch student profile using findUser function
      let student = await findUser(req, res, "findTutors", true, req.session.user._id, true);

      // Check if student or student.subjects is missing or undefined
      if (!student || !student.subjects) {
          return res.redirect('/findTutors.html?message=Student profile not found.&type=error');
      }

      // Extract subjects from student profile
      const subjects = student.subjects.map(subject => ({
          subject: subject.subject,
          qualification: subject.qualification,
          grade: subject.grade,
          learningApproach: subject.learningApproach,
          examBoard: subject.examBoard
      }));

      // Query tutors based on subjects and qualifications
      const tutors = await tutorUser.find({ 
          subjects: { 
              $elemMatch: { 
                  subject: { $in: subjects.map(s => s.subject) },
                  qualification: { $in: subjects.map(s => s.qualification) }
              }
          },
          isAvailable: true
      }).lean(); // Use lean() to get plain JS objects

      // Include matching subject details in each tutor object
      tutors.forEach(tutor => {
          tutor.subjects = tutor.subjects.filter(tutorSubject => 
              subjects.some(studentSubject => 
                  studentSubject.subject === tutorSubject.subject && 
                  studentSubject.qualification === tutorSubject.qualification));
      });

      // Return JSON response with subjects and tutors found
      res.json({ subjects, tutors });
  } catch (error) {
      console.error("Error finding tutors:", error);
      res.status(500).json({ error: 'Failed to find tutors.' });
  }
});




app.get('/student/apiprofile', sessionCheckStudent, async (req, res) => {
  const user = await findUser(req, res, "studentHome", true, req.session.user._id);
  if (user) {
    res.json(user);
  }
});

app.get('/student/userName', sessionCheckStudent, async (req, res) => {
  try {
    // if (!req.session.user._id){
    //   res.json({
    //     fullName: "",
    //     email: ""
    //   })
    // } else {


    //   let user = await findUser(req, res, "studentHome", true, req.session.user._id);
    //   res.json({
    //     fullName: user.fullName,
    //     email: user.email
    //   });
    // }



    let user = await findUser(req, res, "studentHome", true, req.session.user._id);
    res.json({
      fullName: user.fullName,
      email: user.email
    });
    
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});

app.get('/tutor/userName', sessionCheckTutor, async (req, res) => {
  try {
    // if (!req.session.user._id){
    //   res.json({
    //     fullName: "",
    //     email: "",
    //     price: ""
    //   })
    // } else {

    //   let user = await findUser(req, res, "tutorHome", false, req.session.user._id, true);

    //   res.json({
    //     fullName: user.fullName,
    //     email: user.email,
    //     price: user.price
    //   });
    // }


    let user = await findUser(req, res, "tutorHome", false, req.session.user._id, true);

    res.json({
      fullName: user.fullName,
      email: user.email,
      price: user.price
    });
  } catch (error) {
    console.error(error);
    return res.redirect('/tutorHome.html?message=Server error.&type=error');
}
});

app.get('/tutor/apiprofile', sessionCheckTutor, async (req, res) => {
  const user = await findUser(req, res, "tutorHome", false, req.session.user._id, true);
  if (user) {
    res.json(user);
  }
});

app.get('/student/viewProfile', sessionCheckStudent, async (req, res) => {
  try {
      let email = recipientSendEmail;
      let user = await findUser(req, res, "viewTutorProfile", false, email, false);
      res.json( user );
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});

  
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


const storageMessageStudent = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messageFiles/student');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageMessageStudent, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

// Middleware to serve static files
app.use('/uploads', express.static('uploads'));

/*----------------*/
app.post('/student/sendMessage', upload.single('document'), [
    body('content').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/viewMessageStudent.html?message=Invalid input.&type=error');
  }
  const { content } = req.body;

  try {
    // Find the recipient by email in both studentUser and tutorUser collections
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewMessageStudent", false, email, false);

    // Create a new message
    let message = new Message({
      sender: req.session.user._id,
      receiver: recipient._id,
      content: content,
      fromStudent: true,
      studentRead: true
    });

    if (req.file) {
        message.filename = req.file.filename;
        message.originalname = req.file.originalname;
        message.mimetype =  req.file.mimetype;
        message.size =  req.file.size;
    }

    // Save the message
    await message.save();
    // res.status(200).json({ message: 'Message sent successfully.' });
    res.redirect('/viewMessageStudent.html');
  } catch (error) {
    console.error(error);
    return res.redirect('/viewMessageStudent.html?message=Failed to send message .&type=error');
  }
});


// Route to retrieve messages
app.get('/student/getMessage', async (req, res) => {

  try {
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewMessageStudent", false, email, false);

    let messages = await Message.find({
      $or: [
        { sender: req.session.user._id, receiver: recipient._id },
        { receiver: req.session.user._id, sender:recipient._id }
      ]
    });

    await Message.updateMany(
      {
        $or: [
          { sender: req.session.user._id, receiver: recipient._id },
          { receiver: req.session.user._id, sender: recipient._id }
        ]
      },
      { $set: { studentRead: true } }
    );
    
    // Send the messages as JSON response
    res.json({ messages });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewMessageStudent.html?message=Recipient not found.&type=error');
  }
});

app.post('/student/getTutorID', async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    recipientSendEmail = recipientEmail;
    res.redirect('/viewMessageStudent.html');
  } catch(error){
    console.error(error);
    return res.redirect('/viewMessageStudent.html?message=Server error.&type=error');
  }
});


app.post('/student/findTutorProfile', async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    recipientSendEmail = recipientEmail;
    res.redirect('/viewTutorProfile.html');

  } catch(error){
    console.error(error);
    return res.redirect('/viewTutorProfile.html?message=Server error.&type=error');
  }
});


app.get('/student/getTutorProfile', sessionCheckStudent, async (req, res) => {
  try {

      let email = recipientSendEmail;
      let recipient = await findUser(req, res, "findTutor", false, email, false);

      res.json(recipient);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});


// Route to retrieve messages
app.get('/student/viewMessengers', async (req, res) => {

  try {
    // Validate and convert receiverId to ObjectId

    // Find messages where the authenticated user is either the sender or receiver

    // let messages = await Message.find({ sender: req.session.user._id });

    let messages = await Message.find({
      $or: [
        { sender: req.session.user._id },
        { receiver: req.session.user._id }
      ]
    }).sort({ createdAt: -1 }); // Sort messages by creation time in descending order

    let uniqueRecipients = new Set();

    messages.forEach(message => {
      if (message.sender.toString() !== req.session.user._id.toString()) {
        uniqueRecipients.add(message.sender.toString());
      }
      if (message.receiver.toString() !== req.session.user._id.toString()) {
        uniqueRecipients.add(message.receiver.toString());
      }
    });

    let recipients = await tutorUser.find({ _id: { $in: Array.from(uniqueRecipients) } })
      .select('fullName subject email f_originalname f_filename')
      .exec();

    // Create a map to store the most recent message for each recipient
    let recipientMessages = {};
    uniqueRecipients.forEach(recipientId => {
      let mostRecentMessage = messages.find(message => 
        message.sender.toString() === recipientId || message.receiver.toString() === recipientId);
      recipientMessages[recipientId] = mostRecentMessage;
    });

    // Attach the most recent message to the recipient details
    let recipientDetails = recipients.map(recipient => {
      let recipientId = recipient._id.toString();
      return {
        fullName: recipient.fullName,
        subject: recipient.subject,
        email: recipient.email,
        originalname: recipient.f_originalname,
        filename: recipient.f_filename,
        mostRecentMessage: recipientMessages[recipientId] ? recipientMessages[recipientId].content : "No messages yet"
      };
    });

    res.json({ recipients: recipientDetails });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewMessengerStudent.html?message=Failed to retrieve messages.&type=error');
  }
});

const storageMessageTutor = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/messageFiles/tutor');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageMessageTutor, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

// Middleware to serve sta

app.post('/tutor/sendMessage', upload.single('document'), [
    body('content').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/viewMessageTutor.html?message=Invalid input.&type=error');
  }
  const { content } = req.body;

  try{
    // Find the recipient by email in both studentUser and tutorUser collections
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewMessageTutor", true, email, false);
    let message = new Message({
      sender: req.session.user._id,
      receiver: recipient._id,
      content: content,
      fromStudent: false,
      tutorRead: true
    });

    if (req.file) {
      message.filename = req.file.filename;
      message.originalname = req.file.originalname;
      message.mimetype =  req.file.mimetype;
      message.size =  req.file.size;
    }

    // Save the message
    await message.save();
    // res.status(200).json({ message: 'Message sent successfully.' });
    res.redirect('/viewMessageTutor.html');
  } catch (error) {
    console.error(error);
    return res.redirect('/viewMessageTutor.html?message=Failed to send message .&type=error');

  }
});


app.get('/countMessage/:user', async (req, res) => {
  try {
    const { user } = req.params;

    // Determine the read field based on the `user` parameter
    const readField = user === "t" ? 'tutorRead' : 'studentRead';

    // Count unread messages
    let unreadMessagesCount = await Message.countDocuments({
      receiver: req.session.user._id,
      [readField]: false
    });

    res.json({ count: unreadMessagesCount });
  } catch (error) {
    console.error(error);
    return res.status(404).json({ error: 'Server messages error' });
  }
});



// Route to retrieve messages
app.get('/tutor/getMessage', async (req, res) => {
  try{
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewMessageTutor", true, email, false);


    let messages = await Message.find({
      $or: [
        { sender: req.session.user._id, receiver: recipient._id },
        { receiver: req.session.user._id, sender:recipient._id }
      ]
    });

    await Message.updateMany(
      {
        $or: [
          { sender: req.session.user._id, receiver: recipient._id },
          { receiver: req.session.user._id, sender:recipient._id }
        ]
      },
      { $set: { tutorRead: true } }
    );
      
      // Send the messages as JSON response
    res.json({ messages });
  } catch(error){
    console.error(error);
    return res.redirect('/viewMessageTutor.html?message=Server error.&type=error');
  }
});

app.post('/tutor/getStudentID', async (req, res) => {
  const { recipientEmail } = req.body;
  recipientSendEmail = recipientEmail;
  res.redirect('/viewMessageTutor.html');
});


app.post('/tutor/getBookingID2', async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  let user = await findUser(req, res, "viewBookingTutor", true, booking.student, true);
  recipientSendEmail = user.email;
  res.redirect('/viewMessageTutor.html');
});

/*
app.get('/tutor/getStudentProfile', sessionCheckTutor, async (req, res) => {
  try {
      let email = recipientSendEmail;
      let recipient = await studentUser.findOne({ email });

      if (!recipient) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        email: recipient.email,
        fullName: recipient.fullName,
        studyExamBoard: recipient.studyExamBoard,
        subject: recipient.subject,
        learningStyle: recipient.learningStyle,
        tuitionDuration: recipient.tuitionDuration,
        tuitionFrequency: recipient.tuitionFrequency,
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});*/

app.get('/tutor/getStudentProfile2', sessionCheckTutor, async (req, res) => {
  try {
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewMessageTutor", true, email, false);

    // Find and update related booking for lesson plan
    const relatedBooking = await Booking.findOne({ 
      tutor: req.session.user._id, 
      student: recipient._id,
      date: { $gt: new Date() }
    }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking
    res.json({
      recipient: recipient,
      lesson: relatedBooking ? relatedBooking: ""
    });

  } catch(error){
    console.error(error);
    return res.redirect('/viewMessageTutor.html?message=Server error.&type=error');

  }
    
});

app.get('/tutor/getStudentProfileNotes', sessionCheckTutor, async (req, res) => {
  try {
    let bookingID2 = bookingID;
    
    // Find and update related booking for lesson plan
    const booking = await Booking.findById(bookingID2);
    
    res.json(booking);

  } catch(error){
    console.error(error);
    return res.redirect('/lessonReport.html?message=Server error.&type=error');

  }
    
});


app.get('/student/getTutorProfile2', sessionCheckStudent, async (req, res) => {
  try {
      let email = recipientSendEmail;
      let recipient = await findUser(req, res, "viewMessageStudent", false, email, false);

      // Find and update related booking for lesson plan
      const relatedBooking = await Booking.findOne({ 
        tutor: recipient._id, 
        student: req.session.user._id,
        revisionSession: false,
        date: { $gt: new Date() }

      }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking

      res.json({
        recipient: recipient,
        lesson: relatedBooking ? relatedBooking: ""
      });
  } catch (error) {
      console.error(error);
      return res.redirect('/viewMessengerStudent.html?message=Failed to retrieve profile.&type=error');
  }
});

// Route to retrieve messages
app.get('/tutor/viewMessengers', async (req, res) => {

  try {
    // Validate and convert receiverId to ObjectId

    // Find messages where the authenticated user is either the sender or receiver

    let messages = await Message.find({
      $or: [
        { sender: req.session.user._id },
        { receiver: req.session.user._id }
      ]
    }).sort({ createdAt: -1 }); // Sort messages by creation time in descending order

    let uniqueRecipients = new Set();

    messages.forEach(message => {
      if (message.sender.toString() !== req.session.user._id.toString()) {
        uniqueRecipients.add(message.sender.toString());
      }
      if (message.receiver.toString() !== req.session.user._id.toString()) {
        uniqueRecipients.add(message.receiver.toString());
      }
    });

    let recipients = await studentUser.find({ _id: { $in: Array.from(uniqueRecipients) } })
      .select('fullName subject email f_originalname f_filename')
      .exec();

    // Create a map to store the most recent message for each recipient
    let recipientMessages = {};
    uniqueRecipients.forEach(recipientId => {
      let mostRecentMessage = messages.find(message => 
        message.sender.toString() === recipientId || message.receiver.toString() === recipientId);
      recipientMessages[recipientId] = mostRecentMessage;
    });

    // Attach the most recent message to the recipient details
    let recipientDetails = recipients.map(recipient => {
      let recipientId = recipient._id.toString();
      return {
        fullName: recipient.fullName,
        subject: recipient.subject,
        email: recipient.email,
        originalname: recipient.f_originalname,
        filename: recipient.f_filename,
        mostRecentMessage: recipientMessages[recipientId] ? recipientMessages[recipientId].content : "No messages yet"
      };
    });

    res.json({ recipients: recipientDetails });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewMessengerTutor.html?message=Failed to retrieve messages.&type=error');
  }
});

const { v4: uuidv4 } = require('uuid');

app.post('/tutor/newBooking', [
    body('subject').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/newBooking.html?message=Invalid input.&type=error');
  }

  const { revision, subject, bookingDate, bookingTime, recurring, bookingPrice, duration } = req.body;
  try {

    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "newBooking", true, email, false);
    const bookingStartDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
    const bookingEndDateTime = new Date(bookingStartDateTime.getTime() + duration * 60 * 1000);
    // Check if the booking start time is in the past
    const now = new Date();
    if (bookingStartDateTime < now) {
      return res.redirect('/newBooking.html?message=Booking time cannot be in the past.&type=error');
    }

    // Check for initial booking conflict
    if (await hasConflictingBooking(req.session.user._id, recipient._id, bookingStartDateTime, bookingEndDateTime, null)) {
      return res.redirect('/newBooking.html?message=This time slot is not available.&type=error');
    }

    let recurringChoice = (recurring === "Yes");
    let revisionChoice = (revision === "yes");
    const recurringID = uuidv4();
    // Function to create a booking
    const createBooking = async (startDateTime) => {
      let booking = new Booking({
        tutor: req.session.user._id,
        student: recipient._id,
        tutorName: req.session.user.fullName,
        studentName: recipient.fullName,
        subject: subject, 
        date: startDateTime,
        time: bookingTime,
        duration: duration,
        price: bookingPrice,
        recurringID: recurringChoice ? recurringID : null,
        revisionSession: revisionChoice ? true : false,
      });


      await booking.save();
      // await createBooking.save();
    };

    // Create the initial booking
    await createBooking(bookingStartDateTime);

    // If recurring, create bookings for the next 6 months (approximately 26 weeks)
    if (recurringChoice) {
      for (let i = 1; i <= 26; i++) {
        let nextBookingStartDateTime = new Date(bookingStartDateTime);
        nextBookingStartDateTime.setDate(nextBookingStartDateTime.getDate() + (i * 7));
        
        let nextBookingEndDateTime = new Date(nextBookingStartDateTime.getTime() + 60 * 60 * 1000);

        // Check for conflicts with each recurring booking
        if (!(await hasConflictingBooking(req.session.user._id, recipient._id, nextBookingStartDateTime, nextBookingEndDateTime, null))) {
          await createBooking(nextBookingStartDateTime);
        }
      }
    }

    res.redirect('/viewMessageTutor.html?message=Booking created successfully.&type=success');
  } catch(error){
    console.error(error);
    return res.redirect('/newBooking.html?message=Server error.&type=error');
  }
});

app.get('/tutor/viewBookings', async (req, res) => {
  try {
    // Retrieve bookings where the student is the authenticated user and the date is in the future
    let bookings = await Booking.find({ tutor: req.session.user._id, date: { $gt: Date.now() } }).sort({ date: 1 });

    // Extract unique tutor IDs from the bookings
    let uniqueStudents = new Set();
    bookings.forEach(booking => {
      uniqueStudents.add(booking.student.toString());
    });

    // Fetch tutor details including f_originalname and f_filename
    let students = await studentUser.find({ _id: { $in: Array.from(uniqueStudents) } })
      .select('f_originalname f_filename')
      .exec();

    // Map tutor details to bookings
    let bookingsWithStudents = bookings.map(booking => {
      // Find the tutor corresponding to the booking
      let student = students.find(t => t._id.toString() === booking.student.toString());
      return {
        ...booking._doc, // Include all booking details
        student: {
          originalname: student.f_originalname,
          filename: student.f_filename
        }
      };
    });

    res.json({ bookings: bookingsWithStudents });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewBookingTutor.html?message=Failed to retrieve bookings.&type=error');
  }
});

app.get('/tutor/viewOldBookings', async (req, res) => {
  try {
    // Retrieve bookings where the student is the authenticated user and the date is in the future
    let bookings = await Booking.find({ tutor: req.session.user._id, date: { $lt: new Date().setHours(23,59,59,999) } }).sort({ date: -1 });

    // Extract unique tutor IDs from the bookings
    let uniqueStudents = new Set();
    bookings.forEach(booking => {
      uniqueStudents.add(booking.student.toString());
    });

    // Fetch tutor details including f_originalname and f_filename
    let students = await studentUser.find({ _id: { $in: Array.from(uniqueStudents) } })
      .select('f_originalname f_filename')
      .exec();

    // Map tutor details to bookings
    let bookingsWithStudents = bookings.map(booking => {
      // Find the tutor corresponding to the booking
      let student = students.find(t => t._id.toString() === booking.student.toString());
      return {
        ...booking._doc, // Include all booking details
        student: {
          originalname: student.f_originalname,
          filename: student.f_filename
        }
      };
    });

    res.json({ bookings: bookingsWithStudents });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewBookingTutor.html?message=Failed to retrieve bookings.&type=error');
  }
});

app.get('/student/viewOldBookings', async (req, res) => {
  try {
    // Retrieve bookings where the student is the authenticated user and the date is in the future
    let bookings = await Booking.find({ student: req.session.user._id, date: { $lt: new Date().setHours(23,59,59,999) } }).sort({ date: -1 });

    // Extract unique tutor IDs from the bookings
    let uniqueTutors = new Set();
    bookings.forEach(booking => {
      uniqueTutors.add(booking.tutor.toString());
    });

    // Fetch tutor details including f_originalname and f_filename
    let tutors = await tutorUser.find({ _id: { $in: Array.from(uniqueTutors) } })
      .select('f_originalname f_filename')
      .exec();

    // Map tutor details to bookings
    let bookingsWithTutors = bookings.map(booking => {
      // Find the tutor corresponding to the booking
      let tutor = tutors.find(t => t._id.toString() === booking.tutor.toString());
      return {
        ...booking._doc, // Include all booking details
        tutor: {
          originalname: tutor.f_originalname,
          filename: tutor.f_filename
        }
      };
    });

    res.json({ bookings: bookingsWithTutors });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewBookingStudent.html?message=Failed to retrieve bookings.&type=error');
  }
});


app.get('/tutor/viewDayBookings', async (req, res) => {
  try {

    const bookings = await Booking.find({
      tutor: req.session.user._id,
      date: {
        $gte: Date.now(),
        $lte: new Date().setHours(23,59,59,999)
      }
    }).sort({ date: 1 });

    /*const bookings = await Booking.find({
      tutor: req.session.user._id,
      date: {
        $gte: new Date().setUTCHours(0,0,0,0),
        $lte: new Date().setUTCHours(23,59,59,999)
      }
    }).sort({ date: 1 });*/
    
    res.json({ bookings });
  } catch (error) {
    console.error(error);
    return res.redirect('/tutorHome.html?message=Failed to retrieve bookings.&type=error');
  }
});


app.get('/student/viewDayBookings', async (req, res) => {
  try {

      const bookings = await Booking.find({
      student: req.session.user._id,
      date: {
        $gte: Date.now(),
        $lte: new Date().setUTCHours(23, 59, 59, 999)
      }
    }).sort({ date: 1 });
    

/*    const bookings = await Booking.find({
      student: req.session.user._id,
      date: {
        $gte: new Date().setUTCHours(0,0,0,0),
        $lte: new Date().setUTCHours(23,59,59,999)
      }
    }).sort({ date: 1 });*/
    
    res.json({ bookings });
  } catch (error) {
    console.error(error);
    return res.redirect('/studentHome.html?message=Failed to retrieve bookings.&type=error');
  }
});

app.get('/tutor/viewIndividualBookings', async (req, res) => {
  try {
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewMessageTutor", true, email, false);

    const bookings = await Booking.find({
      tutor: req.session.user._id,
      student: recipient._id,
      date: {
        $gte: Date.now(),
      }
    }).sort({ date: 1 });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewMessageTutor.html?message=Failed to retrieve bookings.&type=error');
  }
});

app.get('/tutor/getHomework', async (req, res) => {
  try{
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewHomeworkTutor", true, email, false);
    let homework = await Homework.find({ 
      tutor: req.session.user._id, 
      student: recipient._id 
    }).sort({ posted: -1 }); // Sort by date in ascending order

    res.json({ homework });
  } catch (error){
    console.error(error);
    return res.redirect('/viewHomeworkTutor.html?message=Server error.&type=error');
 
  }
});


app.get('/student/getHomework', async (req, res) => {
  try {
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewHomeworkStudent", false, email, false);
    
    let homework = await Homework.find({ 
      tutor: recipient._id, 
      student: req.session.user._id
    }).sort({ posted: -1 }); // Sort by date in ascending order

    res.json({ homework });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewHomeworkStudent.html?message=Failed to view homework.&type=error');
  }
});

app.get('/tutor/hViewIndividualHomework', async (req, res) => {
  try {
    const homework = await Homework.findById(homeworkID); 
    res.json({ homework });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewHomeworkTutor.html?message=Failed to view homework.&type=error');
  }
});

app.get('/tutor/viewOneBooking', async (req, res) => {
  try {
    const booking = await Booking.findById(bookingID);
    res.json({ booking });
  } catch (error) {
    console.error(error);
    return res.redirect('/editBookingTutor.html?message=Failed to retrieve bookings.&type=error');
  }
});

app.get('/student/viewOneBooking', async (req, res) => {
  try {
    const booking = await Booking.findById(bookingID);
    res.json({ booking });
  } catch (error) {
    console.error(error);
    return res.redirect('/editBookingStudent.html?message=Failed to retrieve bookings.&type=error');
  }//change this part
});

app.get('/student/viewIndividualBookings', async (req, res) => {
  try {
    let email = recipientSendEmail;
    let recipient = await findUser(req, res, "viewMessageStudent", false, email, false);

    const bookings = await Booking.find({
      tutor: recipient._id,
      student: req.session.user._id,
      date: {
        $gte: Date.now(),
      }
    }).sort({ date: 1 });

    res.json({ bookings });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewMessageStudent.html?message=Failed to retrieve bookings.&type=error');
  }
});


app.get('/student/viewBookings', async (req, res) => {
  try {
    // Retrieve bookings where the student is the authenticated user and the date is in the future
    let bookings = await Booking.find({ student: req.session.user._id, date: { $gt: Date.now() } }).sort({ date: 1 });

    // Extract unique tutor IDs from the bookings
    let uniqueTutors = new Set();
    bookings.forEach(booking => {
      uniqueTutors.add(booking.tutor.toString());
    });

    // Fetch tutor details including f_originalname and f_filename
    let tutors = await tutorUser.find({ _id: { $in: Array.from(uniqueTutors) } })
      .select('f_originalname f_filename')
      .exec();

    // Map tutor details to bookings
    let bookingsWithTutors = bookings.map(booking => {
      // Find the tutor corresponding to the booking
      let tutor = tutors.find(t => t._id.toString() === booking.tutor.toString());
      return {
        ...booking._doc, // Include all booking details
        tutor: {
          originalname: tutor.f_originalname,
          filename: tutor.f_filename
        }
      };
    });

    res.json({ bookings: bookingsWithTutors });
  } catch (error) {
    console.error(error);
    return res.redirect('/viewBookingStudent.html?message=Failed to retrieve bookings.&type=error');
  }
});



app.post('/student/confirmLesson', sessionCheckStudent, async (req, res) => {
  const { bookingId, returnUrl } = req.body;

  try {

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.redirect(`/${returnUrl}.html?message=Booking not found.&type=error`);
    }

    if (booking.recurringID) {
      // Confirm all bookings with the same recurringID
      const bookings = await Booking.find({ recurringID: booking.recurringID });

  // Loop through each booking to generate Zoom meeting details
      for (const individualBooking of bookings) {
        const token = await generateAccessToken();
        let tutor = await findUser(req, res, "viewBookingStudent", false, booking.tutor, true);
  
        const meetingData = await createZoomMeeting(
          token,
          tutor.email,
          individualBooking.revisionSession ? 'Revision Session' : 'Tutoring Session',
          individualBooking.time,
          individualBooking.duration
        );

        // Update the booking with the Zoom meeting details
        individualBooking.studentConfirmed = true;
        individualBooking.paymentGiven = true;
        individualBooking.zMeetingId = meetingData.id;
        individualBooking.zMeetingPassword = meetingData.password;
        individualBooking.zJoinUrl = meetingData.join_url;

        // Save the updated booking
        await individualBooking.save();
      }
    } else {
      const token = await generateAccessToken();
      let tutor = await findUser(req, res, "viewBookingStudent", false, booking.tutor, true);
  
      const meetingData = await createZoomMeeting(token, tutor.email, booking.revisionSession? 'Revision Session': 'Tutoring Session', booking.time, booking.duration);
      booking.studentConfirmed = true;
      booking.paymentGiven = true;
      booking.zMeetingId = meetingData.id;
      booking.zMeetingPassword = meetingData.password;
      booking.zJoinUrl = meetingData.join_url;
      await booking.save();

    }
    res.redirect(`/${returnUrl}.html?message=Booking confirmed!&type=success`);

    
    // res.redirect('/viewBookingStudent.html?message=Booking confirmed!&type=success');
  } catch (error) {
    console.log(error);
    res.redirect(`/${returnUrl}.html?message=Server error.&type=error`);
  }
});


app.post('/student/getBookingID', async (req, res) => {
  const { bookingId } = req.body;
  bookingID = bookingId;
  res.redirect('/editBookingStudent.html');
});

app.post('/student/cancelChanges', async (req, res) => {
  const { bookingId, returnUrl } = req.body;
  try {

  
    const booking = await Booking.findById(bookingId);
    let tempBooking = await tempBookingData.findOne({booking: bookingId});
    booking.subject = tempBooking.subject;
    booking.date = tempBooking.date;
    booking.time = tempBooking.time;
    booking.duration = tempBooking.duration;
    booking.price = tempBooking.price;
    booking.tutorConfirmed = true;
    await booking.save();
    await tempBookingData.deleteOne({booking: bookingId});
    res.redirect(`/${returnUrl}.html?message=Lesson changes cancelled.&type=success`);
  } catch (error) {
    console.log(error);
    res.redirect(`/${returnUrl}.html?message=Server error.&type=error`);

  }

});

app.post('/student/getBookingID2', async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  let user = await findUser(req, res, "viewBookingStudent", false, booking.tutor, true);
  recipientSendEmail = user.email;
  res.redirect('/viewMessageStudent.html');
});

app.post('/student/editBooking', [
    body('subject').trim().escape(),
  ],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/editbookingStudent.html?message=Invalid input.&type=error');
  }
  const { subject, bookingDate, bookingTime, duration } = req.body;

  try {
    // Convert bookingDate and bookingTime into a Date object

    const bookingStartDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
    const bookingEndDateTime = new Date(bookingStartDateTime.getTime() + duration * 60 * 1000);

    // Check if the booking start time is in the past
    const now = new Date();
    if (bookingStartDateTime < now) {
      return res.redirect('/editBookingStudent.html?message=Booking time cannot be in the past.&type=error');
    }

    // Find the booking to be edited
    const editBooking = await Booking.findById(bookingID);
    if (!editBooking) {
      return res.redirect('/editBookingStudent.html?message=Booking not found.&type=error');
    }
    // Check for conflicts
    if (await hasConflictingBooking(editBooking.tutor._id, req.session.user._id, bookingStartDateTime, bookingEndDateTime, editBooking._id)) {
      return res.redirect('/editBookingStudent.html?message=This time slot is not available.&type=error');
    }

    let tempBooking = await tempBookingData.findOne({booking: bookingID});
    if (!tempBooking){
      let tempBooking2 = new tempBookingData({
        booking: bookingID,
        subject: editBooking.subject,
        date: editBooking.date,
        time: editBooking.time,
        price: editBooking.price,
        duration: editBooking.duration,
      });
      await tempBooking2.save();    
    }

    editBooking.subject = subject;
    editBooking.date = bookingStartDateTime;
    editBooking.time = bookingTime;
    editBooking.duration = duration;
    editBooking.tutorConfirmed = false;
    editBooking.studentConfirmed = true;

    // Save the booking
    await editBooking.save();

    res.redirect('/viewBookingStudent.html?message=Booking edited successfully.&type=success');
  } catch (error) {
    console.error(error);
    return res.redirect('/editBookingStudent.html?message=Failed to edit booking.&type=error');
  }
});

app.post('/tutor/confirmLesson', sessionCheckTutor, async (req, res) => {
  const { bookingId, returnUrl } = req.body;

  try {

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.redirect(`/${returnUrl}.html?message=Booking not found.&type=error`);
    }

    if (booking.recurringID) {
      // Confirm all bookings with the same recurringID
      const bookings = await Booking.find({ recurringID: booking.recurringID });

      // Loop through each booking to generate Zoom meeting details
      for (const individualBooking of bookings) {
        const token = await generateAccessToken();
        let tutor = await findUser(req, res, "viewBookingTutor", false, booking.tutor, true);
  
        const meetingData = await createZoomMeeting(
          token,
          tutor.email,
          individualBooking.revisionSession ? 'Revision Session' : 'Tutoring Session',
          individualBooking.time,
          individualBooking.duration
        );

        // Update the booking with the Zoom meeting details
        individualBooking.tutorConfirmed = true;
        individualBooking.paymentGiven = true;
        individualBooking.zMeetingId = meetingData.id;
        individualBooking.zMeetingPassword = meetingData.password;
        individualBooking.zJoinUrl = meetingData.join_url;

        // Save the updated booking
        await individualBooking.save();
      }
    } else {
      const token = await generateAccessToken();
      let tutor = await findUser(req, res, "viewBookingTutor", false, booking.tutor, true);
  
      const meetingData = await createZoomMeeting(token, tutor.email, booking.revisionSession? 'Revision Session': 'Tutoring Session', booking.time, booking.duration);
      booking.tutorConfirmed = true;
      booking.zMeetingId = meetingData.id;
      booking.zMeetingPassword = meetingData.password;
      booking.zJoinUrl = meetingData.join_url;
      await booking.save();

      booking.tutorConfirmed = true;
      await booking.save();
    }

    res.redirect(`/${returnUrl}.html?message=Booking confirmed!&type=success`);
  } catch (error) {
    console.log(error);
    res.redirect(`${returnUrl}.html?message=Server error.&type=error`);
  }
});

app.post('/tutor/getBookingID', async (req, res) => {
  const { bookingId } = req.body;
  bookingID = bookingId;
  res.redirect('/editBookingTutor.html');
});

app.post('/tutor/cancelChanges', async (req, res) => {
  const { bookingId, returnUrl } = req.body;
  try{
    const booking = await Booking.findById(bookingId);
    let tempBooking = await tempBookingData.findOne({booking: bookingId});
    booking.subject = tempBooking.subject;
    booking.date = tempBooking.date;
    booking.time = tempBooking.time;
    booking.duration = tempBooking.duration;
    booking.price = tempBooking.price;
    booking.studentConfirmed = true;
    await booking.save();
    await tempBookingData.deleteOne({booking: bookingId});
    res.redirect(`/${returnUrl}.html?message=Lesson changes cancelled.&type=success`);
  } catch (error){
    console.log(error);
    res.redirect(`/${returnUrl}.html?message=Server error.&type=error`);
  }
});


app.post('/tutor/changeDeadline', async (req, res) => {
  const { deadline } = req.body;
  const homework = await Homework.findById(homeworkID); 
  homework.deadline = deadline;
  await homework.save();
  res.redirect('/viewHomeworkTutor.html?message=Homework updated successfully.&type=success');
});

app.post('/tutor/changeScore', async (req, res) => {
  const { score } = req.body;
  if(score>100 || score<0){
    return res.redirect('/hScoreTutor.html?message=Score has to be between 0 and 100.&type=error');
  }
  const homework = await Homework.findById(homeworkID); 
  homework.score = score;
  await homework.save();
  res.redirect('/viewHomeworkTutor.html?message=Homework updated successfully.&type=success');
});

app.post('/lessonNotesSubmit', [body('topics').trim().escape()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/lessonNotes.html?message=Invalid input.&type=error');
  }
  let { topics } = req.body;
  if (typeof topics === 'string') {
    topics = topics.split(',').map(topic => topic.trim()).filter(topic => topic); // Split and trim each topic
  }

  try {
    const bookingID2 = bookingID;
    const booking = await Booking.findById(bookingID2);

    if (!booking) {
      return res.redirect('/lessonNotes.html?message=Booking not found.&type=error');
    }

    if (!booking.notes) {
      booking.notes = [];
    }

    topics.forEach(topic => {
      if (topic) {
        booking.notes.push(topic);
      }
    });

    await booking.save();
    res.redirect('/lessonReport.html?message=Notes added.&type=success');
  } catch (error) {
    console.error('Error saving booking notes:', error);
    res.redirect('/lessonNotes.html?message=Server error.&type=error');
  }
  
});

// Function to generate an OAuth access token
const generateAccessToken = async () => {
  const tokenUrl = 'https://zoom.us/oauth/token';
  const tokenData = {
    grant_type: 'account_credentials',
    account_id: accountId,
  };

  const tokenHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
  };

  try {
    const response = await axios.post(tokenUrl, qs.stringify(tokenData), { headers: tokenHeaders });
    return response.data.access_token;
  } catch (error) {
    console.error('Error generating access token:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to create a Zoom meeting
const createZoomMeeting = async (token, tutorEmail, topic = 'Tutoring Session', bookingStartDateTime, duration = 40) => {
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  tutorEmail = "d9604678@gmail.com";

  const body = {
    topic: topic,
    type: 2, // 1 for instant meeting, 2 for scheduled meeting, etc.
    start_time: bookingStartDateTime,
    duration: duration,
    // schedule_for: tutorEmail
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: true,  // Allow participants to join before host
      mute_upon_entry: true,  // Mute participants upon entry
      waiting_room: false,  // Disable waiting room
    },
  };

  try {
    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', body, config);
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error.response ? error.response.data : error.message);
    throw error;
  }
};

app.get('/redirectToZoomAndOpenNotes', (req, res) => {
  const { zoomUrl } = req.query;
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting...</title>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          // Redirect to Zoom meeting
          window.location.href = "${zoomUrl}";
          // Open lesson notes in a new tab
          window.open('/lessonNotes.html', '_blank');
        });
      </script>
    </head>
    <body>
      <p>Redirecting to your Zoom meeting and opening lesson notes...</p>
    </body>
    </html>
  `);
});


// Route handler for launching a lesson
app.post('/tutor/launchLesson', async (req, res) => {
  const {bookingId} = req.body;
  try {
    bookingID = bookingId;
    const booking = await Booking.findById(bookingID);
    if(booking.revisionSession){
      let user = await findUser(req, res, "viewBookingTutor", false, booking.tutor, true);
      user.revisionCount = user.revisionCount+1;
      await user.save();
    }
    if(booking.zJoinUrl){
      // return res.redirect(`/redirectToZoomAndOpenNotes?zoomUrl=${encodeURIComponent(booking.zJoinUrl)}`);
      return res.redirect('/lessonNotes.html');

    } else {
      return res.redirect('/viewBookingTutor.html?message=Zoom meeting error.&type=error');
    }

  } catch (error) {
    console.error(error);
    return res.redirect('/viewBookingTutor.html?message=Failed to join zoom meeting.&type=error');
  }
});

// Route handler for launching a lesson
app.post('/tutor/launchReport', async (req, res) => {
  const {bookingId} = req.body;
  try {
    bookingID = bookingId;
    const booking = await Booking.findById(bookingID);
    return res.redirect('/lessonNotes.html');
  } catch (error) {
    console.error(error);
    return res.redirect('/viewBookingTutor.html?message=Failed to join zoom meeting.&type=error');
  }
});

app.get('/redirectToZoomAndOpenReview', (req, res) => {
  const { zoomUrl } = req.query;
  res.set('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting...</title>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          // Redirect to Zoom meeting
          window.location.href = "${zoomUrl}";
          // Open lesson notes in a new tab
          window.open('/newReview.html', '_blank');
        });
      </script>
    </head>
    <body>
      <p>Redirecting to your Zoom meeting and opening review...</p>
    </body>
    </html>
  `);
});


app.post('/student/launchLesson', async (req, res) => {
  const { bookingId } = req.body;
  try {
    bookingID = bookingId;
    const booking = await Booking.findById(bookingID);
    let user = await findUser(req, res, "viewBookingStudent", true, booking.student, true);
    if(booking.revisionSession){
      user.revisionCount = user.revisionCount+1;
      await user.save();
    } else {
      user.lessonCount = user.lessonCount+1;
      await user.save();
    }
    if(booking.zJoinUrl){
      return res.redirect(`/redirectToZoomAndOpenReview?zoomUrl=${encodeURIComponent(booking.zJoinUrl)}`);
    } else {
      return res.redirect('/viewBookingStudent.html?message=Zoom meeting error.&type=error');
    }

  } catch (error) {
    console.error(error);
    return res.redirect('/viewBookingStudent.html?message=Failed to create zoom meeting.&type=error');
  }
});

app.get('/tutor/getLessonNotes', sessionCheckTutor, async (req, res) => {
  try {

    const booking = await Booking.findById(bookingID);


    res.json({ notes: booking.notes, subject: booking.subject });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});

app.post('/tutor/cancelOneBooking', async (req, res) => {

  try {

      const booking = await Booking.findById(bookingID); // Assuming bookingID is available in req.body or req.params
      if (!booking) {
          return res.redirect('/editBookingTutor.html?message=Booking not found.&type=error');
      }

      // Find and update related booking for lesson plan
      const relatedBooking = await Booking.findOne({ 
          tutor: booking.tutor, 
          student: booking.student, 
          subject: booking.subject,
          date: { $gt: booking.date }  // Find bookings with a date greater than the current booking date
        }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking
  
      if (relatedBooking) {
        relatedBooking.plan = booking.plan;
        await relatedBooking.save();
      }

      let deletedbooking = await Booking.findByIdAndDelete(bookingID);
      return res.redirect('/viewBookingTutor.html?message=Booking canceled successfully.&type=success');
    } catch (error) {
    console.error(error);
    return res.redirect('/editBookingTutor.html?message=Failed to edit booking.&type=error');
  }
});



app.post('/student/cancelOneBooking', async (req, res) => {
  try {
    const booking = await Booking.findById(bookingID); // Assuming bookingID is available in req.body or req.params
    if (!booking) {
        return res.redirect('/editBookingStudent.html?message=Booking not found.&type=error');
    }

    // Find and update related booking for lesson plan
    const relatedBooking = await Booking.findOne({ 
        tutor: booking.tutor, 
        student: booking.student, 
        subject: booking.subject,
        date: { $gt: booking.date }  // Find bookings with a date greater than the current booking date
      }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking

    if (relatedBooking) {
      relatedBooking.plan = booking.plan;
      await relatedBooking.save();
    }

    let deletedbooking = await Booking.findByIdAndDelete(bookingID);
    return res.redirect('/viewBookingStudent.html?message=Booking canceled successfully.&type=success');
  } catch (error) {
    console.error(error);
    return res.redirect('/editBookingStudent.html?message=Failed to edit booking.&type=error');
  }
});

app.post('/student/cancelRecurringBooking', async (req, res) => {

  try {
    const booking = await Booking.findById(bookingID);

    if (!booking) {
      return res.redirect('/editBookingStudent.html?message=Booking not found.&type=error');
    }

    if (!booking.recurringID) {
      return res.redirect('/editBookingStudent.html?message=Booking is not part of a recurring series.&type=error');
    }

    // Delete all bookings with the same recurringID
    const deletedBookings = await Booking.deleteMany({ recurringID: booking.recurringID });

    if (!deletedBookings.deletedCount) {
      return res.redirect('/editBookingStudent.html?message=No recurring bookings found to cancel.&type=error');
    }

    return res.redirect('/viewBookingStudent.html?message=Recurring bookings canceled successfully.&type=success');
  } catch (error) {
    console.error(error);
    return res.redirect('/editBookingStudent.html?message=Failed to edit booking.&type=error');
  }
});


app.post('/tutor/cancelRecurringBooking', async (req, res) => {
  try {
    const booking = await Booking.findById(bookingID);

    if (!booking) {
      return res.redirect('/editBookingTutor.html?message=Booking not found.&type=error');
    }

    if (!booking.recurringID) {
      return res.redirect('/editBookingTutor.html?message=Booking is not part of a recurring series.&type=error');
    }

    // Delete all bookings with the same recurringID
    const deletedBookings = await Booking.deleteMany({ recurringID: booking.recurringID });

    if (!deletedBookings.deletedCount) {
      return res.redirect('/editBookingTutor.html?message=No recurring bookings found to cancel.&type=error');
    }

    return res.redirect('/viewBookingTutor.html?message=Recurring bookings canceled successfully.&type=success');
  } catch (error) {
    console.error(error);
    return res.redirect('/editBookingTutor.html?message=Failed to edit booking.&type=error');
  }
});




app.post('/tutor/editBooking', [
    body('subject').trim().escape(),
  ],async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/editBookingTutor.html?message=Invalid input.&type=error');
  }
  const { subject, bookingDate, bookingTime, bookingPrice, duration } = req.body;

  try {
    
    const bookingStartDateTime = new Date(`${bookingDate}T${bookingTime}:00.000Z`);
    const bookingEndDateTime = new Date(bookingStartDateTime.getTime() + duration * 60 * 1000);

    // Check if the booking start time is in the past
    const now = new Date();
    if (bookingStartDateTime < now) {
      return res.redirect('/editBookingTutor.html?message=Booking time cannot be in the past.&type=error');
    }

    // Find the booking to be edited
    const editBooking = await Booking.findById(bookingID);
    if (!editBooking) {
      return res.redirect('/editBookingTutor.html?message=Booking not found.&type=error');
    }


    // Check for conflicts
    if (await hasConflictingBooking(req.session.user._id, editBooking.student._id, bookingStartDateTime, bookingEndDateTime, editBooking._id)) {
      return res.redirect('/editBookingTutor.html?message=This time slot is not available.&type=error');
    }
    let tempBooking = await tempBookingData.findOne({booking: bookingID});
    if (!tempBooking){
      let tempBooking2 = new tempBookingData({
        booking: bookingID,
        subject: editBooking.subject,
        date: editBooking.date,
        time: editBooking.time,
        price: editBooking.price,
        duration: editBooking.duration,
      });
      await tempBooking2.save();    
    }
    editBooking.subject = subject;
    editBooking.date = bookingStartDateTime;
    editBooking.time = bookingTime;
    editBooking.duration = duration;
    editBooking.price = bookingPrice;
    editBooking.tutorConfirmed = true;
    editBooking.studentConfirmed = false;

    // Save the booking
    await editBooking.save();

    res.redirect('/viewBookingTutor.html?message=Booking edited successfully.&type=success');
  } catch (error) {
    console.error(error);
    return res.redirect('/editBookingTutor.html?message=Failed to edit booking.&type=error');
  }
});


// Set up multer for file uploads
const storageStudent = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/homeworkFiles/student');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageStudent, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

// Middleware to serve static files
app.use('/uploads', express.static('uploads'));

// Route to handle file uploads
app.post('/student/uploadHomeworkFile', upload.single('document'), [
    body('generatedAnswer').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/hSubmissionStudent.html?message=Invalid input.&type=error');
  }
  try {
    const { generatedAnswer } = req.body;
    if (generatedAnswer){
      const file = new HomeworkFile({
        homework: homeworkID,
        originalname: generatedAnswer,
        isStudent: true,
        isText: true
      });
      await file.save();
    } else {
      const file = new HomeworkFile({
        homework: homeworkID,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        isStudent: true,
        isText: false
      });
      await file.save();
    }
    const homework = await Homework.findById(homeworkID);
    homework.docCount = homework.docCount+1;
    homework.submission = true;
    await homework.save();

    
    return res.redirect('/hSubmissionStudent.html?message=Homework uploaded successfully.&type=success');
  } catch (err) {
    console.error(err);
    return res.redirect('/hSubmissionStudent.html?message=Error uploading file.&type=error');
  }
});

app.get('/student/homeworkFile', async (req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: homeworkID, isStudent: true});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/hSubmissionStudent.html?message=Failed to retrieve homework files.&type=error');
  }
});

app.get('/student/questionFile', async (req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: homeworkID, isStudent: false});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/hSubmissionStudent.html?message=Failed to retrieve homework files.&type=error');
  }
});

// Route to delete an uploadHomeworkFileed file
app.post('/student/deleteHomeworkFile', async (req, res) => {
  const { fileID } = req.body;
  try {
    const file = await HomeworkFile.findByIdAndDelete(fileID);
    if (!file) {
      return res.redirect('/hSubmissionStudent.html?message=Answers not found.&type=error');
    }

    const homework = await Homework.findById(homeworkID);
    homework.docCount = homework.docCount-1;
    if(homework.docCount == 0){
      homework.submission = false;
    }
    await homework.save();

    return res.redirect('/hSubmissionStudent.html?message=Answer deleted.&type=success');
    
  } catch (error) {
    console.error(error);
    return res.redirect('/hSubmissionStudent.html?message=Servererror.&type=error');
  }
});

// Set up multer for file uploads
const storageTutor = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/homeworkFiles/tutor');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

upload = multer({ storage: storageTutor, limits: { fileSize: 25 * 1024 * 1024 } }); // Corrected this line

// Middleware to serve static files
app.use('/uploads', express.static('uploads'));

app.post('/lessonReportSubmit', upload.single('document'), [
    body('topics').trim().escape(),
    body('successTopics').trim().escape(),
    body('weakTopics').trim().escape(),
    body('nextLessonPlan').trim().escape(),
    body('topicName').trim().escape(),
    body('generatedQuestions').trim().escape(),
  ],  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/lessonReport.html?message=Invalid input.&type=error');
  }
  const { topics, successTopics, weakTopics, nextLessonPlan, topicName, deadline, generatedQuestions } = req.body;
  let reportSent = false;
  // Example of how you might handle MongoDB updates
  try {
      const booking = await Booking.findById(bookingID); // Assuming bookingID is available in req.body or req.params
      if (!booking) {
          return res.status(404).send('Booking not found');
      }
      let tutor = await findUser(req, res, "lessonReport", false, booking.tutor, true);
      tutor.lessonCount = tutor.lessonCount+1;
      await tutor.save();

      // Update booking properties
      booking.notes = [];
      // Assuming topics is a comma-separated string of topics
      booking.notes.push(...topics.split(', ')); 
      booking.successTopics = successTopics;
      booking.weakTopics = weakTopics;
      await booking.save();

      // Find and update related booking for lesson plan
      const relatedBooking = await Booking.findOne({ 
        tutor: booking.tutor, 
        student: booking.student, 
        subject: booking.subject,
        date: { $gt: booking.date },  // Find bookings with a date greater than the current booking date
      }).sort({ date: 1 });  // Sort by date in ascending order to get the earliest one after the current booking
  
      if (relatedBooking) {
        relatedBooking.plan = nextLessonPlan;
        await relatedBooking.save();
        reportSent = true;
      }
      let messageDesign = `
        <div id = "report" class = "reportStyle">
          <h3>Lesson Report</h3>
          <p><strong>Topics Covered:</strong></p>
          <ul>
            ${topics.split(', ').map(topic => `<li>${topic}</li>`).join('')}
          </ul>
          <p><strong>Success Topics:</strong></p>
          <ul>
            ${successTopics.split('\n').map(topic => `<li>${topic}</li>`).join('')}
          </ul>
          <p><strong>Weak Topics:</strong></p>
          <ul>
            ${weakTopics.split('\n').map(topic => `<li>${topic}</li>`).join('')}
          </ul>
          <p><strong>Next Lesson Plan:</strong> ${nextLessonPlan}</p>
        </div>
      `;
      let message = new Message({
        sender: booking.tutor,
        receiver: booking.student,
        content: messageDesign,
        fromStudent: false
      });
    
      // Save the message
      await message.save();

      if (topicName === null || deadline===null || !topicName || !deadline){
        return res.redirect('/viewBookingTutor.html?message=Report complete. &type=success');
      } else {
        let homework = new Homework({
          tutor: booking.tutor._id,
          student: booking.student._id,
          posted: Date.now(),
          topicName: topicName,
          deadline: deadline,
        })
        await homework.save();

        if (generatedQuestions){
          const file = new HomeworkFile({
            homework: homework._id,
            originalname: generatedQuestions,
            isStudent: false,
            isText: true
          });
          await file.save();
        } else {

          const file = new HomeworkFile({
            homework: homework._id,
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            isStudent: false,
            isText: true
          });
          await file.save();
        }
        
        return res.redirect('/viewBookingTutor.html?message=Report complete and homework sent.&type=success');
      }
  } catch (error) {
      if (reportSent){
        return res.redirect('/viewBookingTutor.html?message=Report complete. &type=success');
      }
      console.log(error);
      return res.redirect('/lessonReport.html?message=Server Error.&type=error');
  }
});

app.post('/tutor/addHomework', upload.single('document'), [
    body('topicName').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/addHomework.html?message=Invalid input.&type=error');
  }
  const {topicName, deadline } = req.body;

  let email = recipientSendEmail;
  let recipient = await findUser(req, res, "addHomework", true, email, false);
  
  let homework = new Homework({
    tutor: req.session.user._id,
    student: recipient._id,
    posted: Date.now(),
    topicName: topicName,
    deadline: deadline,
  })
  await homework.save();

  const file = new HomeworkFile({
    homework: homework._id,
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    isStudent: false,
    isText: false,
  });
  await file.save();
  
  return res.redirect('/viewHomeworkTutor.html?message=Homework sent.&type=success');
  
});

app.post('/student/reviewSubmit', [
  body('review').trim().escape(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/newReview.html?message=Invalid input.&type=error');
  }

  const { score, review } = req.body;

  // Example of how you might handle MongoDB updates
  try {
    let student = await findUser(req, res, "newReview", true, req.session.user._id);

    let newReview = {
      reviewScore: score,
      student: student,
      text: null
    }

    if (review !== null) {
      newReview.text = review;
    }
    
    let tutor = await tutorUser.findOne({email: recipientSendEmail});
    tutor.reviews.unshift(newReview);
    tutor.reviewCount = tutor.reviewCount+1;
    await tutor.save();

    return res.redirect('/viewMessageStudent.html?message=Review sent.&type=success');
  } catch (error) {
      console.error(error);
      return res.redirect('/newReview.html?message=Server Error.&type=error');
  }
});

// Route to handle file uploads
app.post('/tutor/uploadHomeworkFile', upload.single('document'), [
    body('generatedQuestions').trim().escape(),
  ], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/hQuestionTutor.html?message=Invalid input.&type=error');
  }
  try {
    const { generatedQuestions } = req.body;
    if (generatedQuestions){
      const file = new HomeworkFile({
        homework: homeworkID,
        originalname: generatedQuestions,
        isStudent: false,
        isText: true
      });
      await file.save();

    } else {
      const file = new HomeworkFile({
        homework: homeworkID,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        isStudent: false,
        isText: false
        
      });
      await file.save();
    }
    return res.redirect('/hQuestionTutor.html?message=Homework uploaded successfully.&type=success');
  } catch (err) {
    console.error(err);
    return res.redirect('/hQuestionTutor.html?message=Error uploading file.&type=error');
  }
});

app.get('/tutor/homeworkFile', async (req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: homeworkID, isStudent: false});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/hSubmissionTutor.html?message=Failed to retrieve homework files.&type=error');
  }
});

app.get('/tutor/submissionFile', async (req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: homeworkID, isStudent: true});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/hSubmissionStudent.html?message=Failed to retrieve homework files.&type=error');
  }
});

// Route to delete an uploaded file
app.post('/tutor/deleteHomeworkFile', async (req, res) => {
  const { fileID } = req.body;
  try {
    const file = await HomeworkFile.findByIdAndDelete(fileID);
    if (!file) {
      return res.redirect('/hQuestionTutor.html?message=Homework not found.&type=error');
    }
    return res.redirect('/hQuestionTutor.html?message=Question Deleted.&type=success');
    
  } catch (error) {
    console.error(error);
    return res.redirect('/hQuestionTutor.html?message=Servererror.&type=error');
  }
});

app.post('/homework/:targetPage', async (req, res) => {
  try{
    const { homeworkId } = req.body;
    const { targetPage } = req.params;
    homeworkID = homeworkId;

    const targetPagePath = `/${targetPage}.html`;
    res.redirect(targetPagePath);
  } catch(error){
    console.error(error);
  }
});

app.post('/generateQuestions', async (req, res) => {
  const { topic, number } = req.body;

  try {
      const chatCompletion = await openai.chat.completions.create({
          messages: [
              { role: "system", content: 'You are a question bank, giving practice exam questions to users.' },
              { role: 'user', content: `Output ${number} questions on the following topic: ${topic}.` }
          ],
          model: 'gpt-3.5-turbo',
      });

      const questions = chatCompletion.choices.map(choice => choice.message.content);
      res.json({ success: true, questions });

  } catch (error) {
      console.error(`Error generating questions: ${error.message}`);
      res.json({ success: false, message: 'Failed to generate questions due to a server error.' });
  }
});