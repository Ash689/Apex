
require('dotenv').config();
const { body, validationResult } = require('express-validator');
const validateDateOfBirth = require('../../utils/validateDateOfBirth'); 
const findUser = require('../../utils/findUser');
const formatInput = require('../../utils/formatInput');
const fs = require('fs');
const {verifyIDAdmin, verifyProfilePicAdmin} = require('../../utils/verification/uploads');
const updateBankEmail = require('../../utils/updateBankDetails');
const { trusted } = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_TOKEN)


exports.config = async (req, res) => {
  const {
    fullName,
    dateOfBirth,
    postcode,
    firstLineAddress,
    number,
    tuitionType
  } = req.body;

  try{
    let user = await findUser(req, res, "configProfile", req.session.user._id);

    if (dateOfBirth) {
      const dobError = validateDateOfBirth(dateOfBirth, 18);
      if (dobError) {
        return res.redirect(`/tutor/configProfile.html?message=${encodeURIComponent(dobError)}&type=error`);
      } else {
        user.dateOfBirth = dateOfBirth;
      }
    }

    if (fullName){
      let formatted_fullName = await formatInput(fullName);
      user.fullName = formatted_fullName;
    }

    user.postcode = postcode ? postcode: null;
    user.firstLineAddress = firstLineAddress ? firstLineAddress : null;
    user.number = number ? number.trim(): null;
    user.tuitionType = tuitionType ? tuitionType.trim() : null;

    await user.save();

    if(req.file){
      user.f_filename = req.file.filename,
      user.f_originalname = req.file.originalname,
      user.f_mimetype =  req.file.mimetype,
      user.f_size = req.file.size,
      await user.save();

      let details = {
        _id: user._id,
        fullName: user.fullName,
        number: user.number,
        email: user.email,
        isTutor: true,
        filename: `uploads/profileFiles/tutor/profilePicture/${user.f_filename}`,
        originalname: user.f_originalname,
        mimetype: user.f_mimetype,
        size: user.f_size,
      };
      await verifyProfilePicAdmin(details);
    }  

    res.redirect('/tutor/verifyID.html');
  } catch (error){
    console.error(error);
    res.redirect('/tutor/configSubject.html?message=Server error.&type=error');
  
  }
};

exports.sendID = async (req, res) => {
  const {description} = req.body;

  try{
    if(!req.file){
      return res.redirect(`/tutor/verifyID.html?message=Please upload an ID picture &type=error`);
    }
    let user = await findUser(req, res, "verifyID", req.session.user._id);
    console.log(user.id_filename);

    if (user.id_filename){
      fs.unlinkSync(`uploads/profileFiles/tutor/id/${user.id_filename}`);
    }
    
    user.id_filename = req.file.filename,
    user.id_originalname = req.file.originalname,
    user.id_mimetype =  req.file.mimetype,
    user.id_size = req.file.size,

    // Save the updated user
    await user.save();

    let details = {
      _id: user._id,
      fullName: user.fullName,
      number: user.number,
      email: user.email,
      isTutor: true,
      filename: `uploads/profileFiles/tutor/id/${user.id_filename}`,
      originalname: user.id_originalname,
      mimetype: user.id_mimetype,
      size: user.id_size,
      
    };
    await verifyIDAdmin(details);

    res.redirect('/tutor/verifyID.html?message=ID added successfully, awaiting verification.&type=success');
  } catch (error){
    console.error(error);
    res.redirect('/tutor/verifyID.html?message=Server error.&type=error');
  
  }
};

exports.sendDBS = async (req, res) => {
  try{
    if(!req.file){
      return res.redirect(`/tutor/verifyID.html?message=Please upload an ID picture &type=error`);
    }
    let user = await findUser(req, res, "configProfile", req.session.user._id);

    if (user.dbs_filename){
      fs.unlinkSync(`uploads/profileFiles/tutor/dbs/${user.dbs_filename}`);
    }

    user.dbs_filename = req.file.filename,
    user.dbs_originalname = req.file.originalname,
    user.dbs_mimetype =  req.file.mimetype,
    user.dbs_size = req.file.size,

    // Save the updated user
    await user.save();
    let details = {
      _id: user._id,
      fullName: user.fullName,
      number: user.number,
      email: user.email,
      isTutor: true,
      filename: user.dbs_filename,
      filename: `uploads/profileFiles/tutor/dbs/${user.dbs_filename}`,
      originalname: user.dbs_originalname,
      mimetype: user.dbs_mimetype,
      size: user.dbs_size,
    };
    await verifyIDAdmin(details);

    res.redirect('/tutor/verifyID.html?message=DBS added successfully, awaiting verification.&type=success');
  } catch (error){
    console.error(error);
    res.redirect('/tutor/verifyID.html?message=Server error.&type=error');
  
  }
};

exports.getVerifyID = async (req, res) => {
  try{
    let user = await findUser(req, res, "verifyID", req.session.user._id);
    res.json({
      email: user.email,
      id_file: user.id_filename,
      dbs_file: user.dbs_filename,
      isDBSVerified: user.isDBSVerified,
      isIDVerified: user.isIDVerified,

    });
  } catch (error) {
    console.log(error);
    console.error("Error saving profile: ", error);
    res.redirect('/tutor/login.html?message=Error, please log in.&type=error');
  }
};


exports.createStripeAccount = async (req, res) => {
  let user = await findUser(req, res, "configBanking", req.session.user._id);
  if (user.stripeAccount){
    return res.json({
      link: '/tutor/configSubject.html'
    });
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    country: 'GB', // Specify the country (Great Britain)
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.URL}/tutor/configBanking.html?message=Banking details not added.&type=error`,
    return_url: `${process.env.URL}/tutor/configBanking.html?account=${account.id}`,
    type: 'account_onboarding',
  });

  return res.json({
    link: accountLink.url
  });
};

exports.bankStatus = async (req, res) => {
  let user = await findUser(req, res, "configBanking", req.session.user._id);
  let success = true;
  if (!user.stripeAccount){
    success = false;
  }

  return res.json({
    success: success
  });
};

exports.completeBankingSetup = async (req, res) => {
  const { accountId } = req.body;
  try {
    success = false;
    let user = await findUser(req, res, "configBanking", req.session.user._id);
    if (user.stripeAccount){
      res.redirect('/tutor/configBanking.html?message=Error, account already created.&type=error');
    }

    let id = await stripe.accounts.retrieve(accountId);

    if (id) {    
      user.stripeAccount = accountId;

      await user.save();
      success = true;
    }
    return res.json({
      success: success
    });
  } catch(error) {
    console.log(error);
    res.redirect(`/tutor/configBanking.html?message=Error configuring bank details.&type=error`);
  }
};

exports.updateStripeAccount = async (req, res) => {

  try{    
    let user = await findUser(req, res, "configProfile", req.session.user._id);

    let details = {
      _id: user._id,
      fullName: user.fullName,
      number: user.number,
      email: user.email,
      isTutor: true,      
    };
    await updateBankEmail(details);

    
    res.redirect(`/tutor/home.html?message=Request sent, email will be sent shortly to '${user.email}'.&type=success`);

  } catch (error) {
    console.log(error);
    res.redirect('/tutor/home.html?message=Error sending request.&type=error');
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

    res.redirect('/tutor/home.html?message=Days added successfully.&type=success');

  } catch (error) {
    console.error(error);
    res.redirect('/tutor/configDays.html?message=Server error.&type=error');
  }
};

exports.changePic = async (req, res) => {
  try{

    if(!req.file){
      return res.redirect(`/tutor/home.html?message=Please upload an image &type=error`);
    }
    
    let user = await findUser(req, res, "home", req.session.user._id);
    
    fs.unlinkSync(`uploads/profileFiles/tutor/profilePicture/${user.f_filename}`);
    // Update the necessary fields
    user.f_filename = req.file.filename,
    user.f_originalname = req.file.originalname,
    user.f_mimetype =  req.file.mimetype,
    user.f_size = req.file.size,
    user.isPictureVerified = false;

    // Save the updated user
    await user.save();

    let details = {
      _id: user._id,
      fullName: user.fullName,
      number: user.number,
      email: user.email,
      isTutor: true,
      filename: `uploads/profileFiles/tutor/profilePicture/${user.f_filename}`,
      originalname: user.f_originalname,
      mimetype: user.f_mimetype,
      size: user.f_size,
    };
    await verifyProfilePicAdmin(details);
    
  res.redirect('/tutor/home.html?message=Profile uploaded successfully, awaiting verification.&type=success');
  } catch (error){
    console.error(error);
    return res.redirect('/tutor/home.html?message=Server Error.&type=error');
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