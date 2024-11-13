const { body, validationResult } = require('express-validator');
const validateDateOfBirth = require('../../utils/validateDateOfBirth'); 
const findUser = require('../../utils/findUser');
const formatInput = require('../../utils/formatInput');
const {verifyIDAdmin, verifyProfilePicAdmin} = require('../../utils/verification/uploads');
const fs = require('fs');

exports.config = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.redirect('/student/configProfile.html?message=Invalid input.&type=error');
    }

    const { fullName, dateOfBirth, postcode, firstLineAddress, number } = req.body;

    try {
        let user = await findUser(req, res, "configProfile", req.session.user._id);

        if (dateOfBirth){
          const dobError = validateDateOfBirth(dateOfBirth, 6);
          if (dobError) {
            return res.redirect(`/student/configProfile.html?message=${encodeURIComponent(dobError)}&type=error`);
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
        user.number = number? number.trim() : null;
        await user.save();

        if(req.file){
          user.f_filename = req.file.filename;
          user.f_originalname = req.file.originalname;
          user.f_mimetype = req.file.mimetype;
          user.f_size = req.file.size;
          await user.save();

          let details = {
            _id: user._id,
            fullName: user.fullName,
            number: user.number,
            email: user.email,
            isTutor: false,
            filename: `uploads/profileFiles/student/profilePicture/${user.f_filename}`,
            originalname: user.f_originalname,
            mimetype: user.f_mimetype,
            size: user.f_size,
          };
          await verifyProfilePicAdmin(details);
        }


        res.redirect('/student/verifyID.html');
    } catch (error) {
        console.error("Error saving profile: ", error);
        res.redirect('/student/configProfile.html?message=Server error.&type=error');
    }
};

exports.sendID = async (req, res) => {
  const {description} = req.body;

  try{
    if(!req.file){
      return res.redirect(`/student/verifyID.html?message=Please upload an ID picture &type=error`);
    }
    let user = await findUser(req, res, "verifyID", req.session.user._id);

    if (user.id_filename){
      fs.unlinkSync(`uploads/profileFiles/student/id/${user.id_filename}`);
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
      isTutor: false,
      filename: `uploads/profileFiles/student/id/${user.id_filename}`,
      originalname: user.id_originalname,
      mimetype: user.id_mimetype,
      size: user.id_size,
    };
    await verifyIDAdmin(details);

    res.redirect('/student/verifyID.html?message=ID added successfully, awaiting verification.&type=success');
  } catch (error){
    console.error(error);
    res.redirect('/student/verifyID.html?message=Server error.&type=error');
  
  }
};

exports.getVerifyID = async (req, res) => {
  try{
    let user = await findUser(req, res, "verifyID", req.session.user._id);
    res.json({
      email: user.email,
      id_file: user.id_filename,
      isIDVerified: user.isIDVerified,
    });
  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/student/login.html?message=Error, please log in.&type=error');
  }
};

exports.addSubject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/student/configSubject.html?message=Invalid input.&type=error');
  }

  const {subject, qualification, expectedGrade, desiredGrade, learningApproach, examBoard } = req.body;

  try {
    let user = await findUser(req, res, "configSubject", req.session.user._id);

    // Check if the subject with the same qualification already exists
    let subjectExists = user.subjects.some(subj => 
      subj.subject.trim().toLowerCase() === subject.trim().toLowerCase() &&
      subj.qualification.trim().toLowerCase() === qualification.trim().toLowerCase()
    );

    if (subjectExists) {
      return res.redirect('/student/configSubject.html?message=Subject with this qualification already exists.&type=error');
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

    res.redirect('/student/configSubject.html?message=Subject added successfully.&type=success');
  } catch (error) {
    console.error("Error saving profile: ", error);
    res.redirect('/student/configSubject.html?message=Server error.&type=error');
  }
};


exports.cancelSubject = async (req, res) => {

    const {subject} = req.body;
  
    try {
      let user = await findUser(req, res, "configSubject", req.session.user._id);
  
      const subjectIndex = user.subjects.findIndex(subj => subj.subject === subject);
  
      if (subjectIndex !== -1) {
        // Remove the subject from the array
        user.subjects.splice(subjectIndex, 1);
        await user.save();
        res.redirect('/student/configSubject.html?message=Subject removed successfully.&type=success');
      } else {
        res.redirect('/student/configSubject.html?message=Subject not found.&type=error');
      }
  
    } catch (error) {
      console.error("Error saving profile: ", error);
      res.redirect('/student/configSubject.html?message=Server error.&type=error');
    }
};

exports.changePic = async (req, res) => {
    try {
      if(!req.file){
        return res.redirect(`/student/home.html?message=Please upload an image &type=error`);
      }

      let user = await findUser(req, res, "studentHome", req.session.user._id); 

      fs.unlinkSync(`uploads/profileFiles/student/profilePicture/${user.f_filename}`);

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
        isTutor: false,
        filename: `uploads/profileFiles/student/profilePicture/${user.f_filename}`,
        originalname: user.f_originalname,
        mimetype: user.f_mimetype,
        size: user.f_size,
      };
      await verifyProfilePicAdmin(details);
      
      res.redirect('/student/home.html?message=Profile uploaded successfully, awaiting verification.&type=success');
    } catch (error) {
      console.error("Error saving profile: ", error);
      res.redirect('/student/home.html?message=Server Error.&type=error');
    }
};

