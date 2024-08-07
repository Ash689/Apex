const { body, validationResult } = require('express-validator');
const validateDateOfBirth = require('../../utils/validateDateOfBirth'); // Assuming you have a utility function for this
const findUser = require('../../utils/findUser');

exports.config = async (req, res) => {
  const {
    fullName,
    dateOfBirth,
    town,
    number,
    tuitionType
  } = req.body;

  try{

    const dobError = validateDateOfBirth(dateOfBirth, 18);
    if (dobError) {
      return res.redirect(`/tutor/configProfile.html?message=${encodeURIComponent(dobError)}&type=error`);
    }
    
    if(!req.file){
      return res.redirect(`/student/configProfile.html?message=Please upload profile picture&type=error`);
    }
    
    let user = await findUser(req, res, "configProfile", req.session.user._id);
    

    // Update the necessary fields
    user.fullName = fullName.trim();
    user.dateOfBirth = dateOfBirth;
    user.town = town.trim();
    user.number = number.trim();
    user.tuitionType = tuitionType.trim();
    user.f_filename = req.file.filename,
    user.f_originalname = req.file.originalname,
    user.f_mimetype =  req.file.mimetype,
    user.f_size = req.file.size,

    // Save the updated user
    await user.save();

    res.redirect('/tutor/configSubject.html');
  } catch (error){
    console.error(error);
    res.redirect('/tutor/configSubject.html?message=Server error.&type=error');
  
  }
};

exports.addSubject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/configSubject.html?message=Invalid input.&type=error');
  }

  const {subject, qualification, grade, teachingApproach, examBoard } = req.body;

  try {    
    let user = await findUser(req, res, "configSubject", req.session.user._id);

    // Check if the subject with the same qualification already exists
    let subjectExists = user.subjects.some(subj => 
      subj.subject.trim().toLowerCase() === subject.trim().toLowerCase() &&
      subj.qualification.trim().toLowerCase() === qualification.trim().toLowerCase()
    );

    if (subjectExists) {
      return res.redirect('/tutor/configSubject.html?message=Subject with this qualification already exists.&type=error');
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

    res.redirect('/tutor/configSubject.html?message=Subject added successfully.&type=success');
  } catch (error) {
    console.error(error);
    res.redirect('/tutor/configSubject.html?message=Server error.&type=error');
  }
};


exports.cancelSubject = async (req, res) => {

  const { subject } = req.body;

  try {

    
    let user = await findUser(req, res, "configSubject", req.session.user._id);

    const subjectIndex = user.subjects.findIndex(subj => subj.subject === subject);

    if (subjectIndex !== -1) {
      // Remove the subject from the array
      user.subjects.splice(subjectIndex, 1);
      await user.save();
      res.redirect('/tutor/configSubject.html?message=Subject removed successfully.&type=success');
    } else {
      res.redirect('/tutor/configSubject.html?message=Subject not found.&type=error');
    }

  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/tutor/configSubject.html?message=Server error.&type=error');
  }
};

exports.addDays = async (req, res) => {
  const { daysAvailable } = req.body;

  try {
    
    let user = await findUser(req, res, "configDays", req.session.user._id);

    if (!daysAvailable) {
      res.redirect('/tutor/configDays.html?message=You must pick at least one day.&type=error');
      return;
    }

    // Split the comma-separated string into an array of days
    const newDays = daysAvailable.split(',');

    // Clear existing daysAvailable array and add new days
    user.daysAvailable = newDays.map(day => ({ day }));

    // Save the updated user object
    await user.save();

    // Redirect to tutor home page after successfully adding days
    res.redirect('/tutor/home.html');

  } catch (error) {
    console.error(error);
    res.redirect('/tutor/configDays.html?message=Server error.&type=error');
  }
};

exports.changePic = async (req, res) => {
  
  let user = await findUser(req, res, "home", req.session.user._id);

  try{
    // Update the necessary fields
    user.f_filename = req.file.filename,
    user.f_originalname = req.file.originalname,
    user.f_mimetype =  req.file.mimetype,
    user.f_size = req.file.size,

    // Save the updated user
    await user.save();
    
  res.redirect('/tutor/home.html?message=Profile updated successfully.&type=success');
  } catch (error){
    console.error(error);
    return res.redirect('/tutor/home.html?message=Error, please enter a valid image.&type=error');
  }
};

exports.changePrice = async(req, res) => {
  const { newPrice } = req.body;

  // Validate the new price
  if (newPrice <= 0) {
    return res.redirect('/tutor/home.html?message=Price must be greater than 0.&type=error');
  }

  try {
    let user = await findUser(req, res, "home", req.session.user._id);

    // Update the necessary fields
    user.price = newPrice;

    // Save the updated user
    await user.save();

    res.redirect('/tutor/home.html?message=Profile updated successfully.&type=success');
  } catch (error) {
    res.redirect('/tutor/home.html?message=Error updating profile.&type=error');
  }
};

exports.changeTuitionType = async(req, res) => {
  const { newTuitionType } = req.body;

  try {

    if (newTuitionType.length < 10 || newTuitionType > 100){
      res.redirect('/tutor/home.html?message=Text must be between 10 - 100 characters.&type=error');
    }
    let user = await findUser(req, res, "home", req.session.user._id);

    // Update the necessary fields
    user.tuitionType = newTuitionType;

    // Save the updated user
    await user.save();

    res.redirect('/tutor/home.html?message=Profile updated successfully.&type=success');
  } catch (error) {
    res.redirect('/tutor/home.html?message=Error updating profile.&type=error');
  }
};

exports.changeAvailability = async(req, res) => {
  try {
    let user = await findUser(req, res, "home", req.session.user._id);

    // Update the necessary fields
    user.isAvailable = !user.isAvailable;

    // Save the updated user
    await user.save();

    res.redirect('/tutor/home.html?message=Profile updated successfully.&type=success');
  } catch (error) {
    res.redirect('/tutor/home.html?message=Error updating profile.&type=error');
  }
};