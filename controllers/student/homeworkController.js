const findUser = require('../../utils/findUser'); 
const Homework = require('../../models/homework');
const HomeworkFile = require('../../models/homeworkFile');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const {sendHomeworkEmail, sendSubmissionEmail} = require('../../utils/email/homework');

exports.getHomework = async(req, res) => {
  try {
    let recipient = await findUser(req, res, "viewHomework", req.session.recipientID, true);
    
    let homework = await Homework.find({ 
      tutor: recipient._id, 
      student: req.session.user._id
    }).sort({ posted: -1 }); // Sort by date in ascending order

    res.json({ homework });
  } catch (error) {
    console.error(error);
    return res.redirect('/student/viewHomework.html?message=Failed to view homework.&type=error');
  }
};

exports.uploadHomeworkFile = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/student/submission.html?message=Invalid input.&type=error');
  }
  try {
    const { generatedAnswer } = req.body;
    if (generatedAnswer){
      const file = new HomeworkFile({
        homework: req.session.homeworkID,
        originalname: generatedAnswer,
        isStudent: true,
        isText: true
      });
      await file.save();
    } else {
      if (!req.file){
        return res.redirect('/student/submission.html?message=Please upload a file.&type=error');

      }
      const file = new HomeworkFile({
        homework: req.session.homeworkID,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        isStudent: true,
        isText: false
      });
      await file.save();
    }
    const homework = await Homework.findById(req.session.homeworkID);
    homework.docCount = homework.docCount+1;
    homework.submission = true;
    await homework.save();

    let sender = await findUser(req, res, "addHomework", req.session.user._id);
    let recipient = await findUser(req, res, "addHomework", req.session.recipientID, true);

    await sendSubmissionEmail(recipient.email, homework.topicName, recipient.fullName.split(" ")[0], sender.fullName.split(" ")[0], homework.deadline);

    
    return res.redirect('/student/submission.html?message=Homework uploaded successfully.&type=success');
  } catch (err) {
    console.error(err);
    return res.redirect('/student/submission.html?message=Error uploading file.&type=error');
  }
};

exports.homeworkFile = async(req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: req.session.homeworkID, isStudent: true});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/student/submission.html?message=Failed to retrieve homework files.&type=error');
  }

};

exports.questionFile = async(req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: req.session.homeworkID, isStudent: false});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/student/submission.html?message=Failed to retrieve homework files.&type=error');
  }
};

exports.deleteHomeworkFile = async(req, res) => {
  const { fileID } = req.body;
  try {

    let file = await HomeworkFile.findByIdAndDelete(fileID);
    if (file) {
      if (!file.isText){
        fs.unlinkSync(`uploads/homeworkFiles/student/${file.filename}`);
      }
    } else {
      return res.redirect('/student/submission.html?message=Answers not found.&type=error');
    }

    const homework = await Homework.findById(req.session.homeworkID);
    homework.docCount = homework.docCount-1;
    if(homework.docCount == 0){
      homework.submission = false;
    }
    await homework.save();

    return res.redirect('/student/submission.html?message=Answer deleted.&type=success');
    
  } catch (error) {
    console.error(error);
    return res.redirect('/student/submission.html?message=Servererror.&type=error');
  }
};

exports.homework = async (req, res, pageType) => {
  try {
    const { homeworkId } = req.body;
    req.session.homeworkID = homeworkId;
    let targetPagePath = '/student/';
    
    if (pageType === "submission") {
      targetPagePath += 'submission.html';
    } else{
      targetPagePath += 'question.html';
    }
    
    return res.redirect(targetPagePath);
  } catch (error) {
    console.error(error);
  }
};