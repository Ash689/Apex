const findUser = require('../../utils/findUser'); // Assuming you have a utility function for this
const Homework = require('../../models/homework');
const HomeworkFile = require('../../models/homeworkFile');
const OpenAI = require('openai');
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const config = require('../../config');

exports.getHomework = async(req, res) => {
  try{
    let recipient = await findUser(req, res, "viewHomework", req.session.recipientID, true);
    
    let homework = await Homework.find({ 
      tutor: req.session.user._id, 
      student: recipient._id 
    }).sort({ posted: -1 }); // Sort by date in ascending order
    res.json({ homework });
  } catch (error){
    console.error(error);
    return res.redirect('/tutor/viewHomework.html?message=Server error.&type=error');
  }
};

exports.uploadHomeworkFile = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/question.html?message=Invalid input.&type=error');
  }
  try {
    const { generatedQuestions } = req.body;
    if (generatedQuestions){
      const file = new HomeworkFile({
        homework: req.session.homeworkID,
        originalname: generatedQuestions,
        isStudent: false,
        isText: true
      });
      await file.save();

    } else if (req.file) {
      const file = new HomeworkFile({
        homework: req.session.homeworkID,
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        isStudent: false,
        isText: false
        
      });
      await file.save();
    }
    return res.redirect('/tutor/question.html?message=Homework uploaded successfully.&type=success');
  } catch (err) {
    console.error(err);
    return res.redirect('/tutor/question.html?message=Error uploading file.&type=error');
  }
};

exports.homeworkFile = async(req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: req.session.homeworkID, isStudent: false});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/submission.html?message=Failed to retrieve homework files.&type=error');
  }
};

exports.submissionFile = async(req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: req.session.homeworkID, isStudent: true});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/submission.html?message=Failed to retrieve homework files.&type=error');
  }
}

exports.questionFile = async(req, res) => {
  try {
    let file = await HomeworkFile.find({ homework: req.session.homeworkID, isStudent: false});
    // let file = await HomeworkFile.find();
    res.json(file);
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/submission.html?message=Failed to retrieve homework files.&type=error');
  }
};

exports.deleteHomeworkFile = async(req, res) => {
  const { fileID } = req.body;
  try {
    let file = await HomeworkFile.findByIdAndDelete(fileID);
    if (file) {
      if(!file.isText){
        fs.unlinkSync(`uploads/homeworkFiles/tutor/${file.filename}`);
      }
    } else {
      return res.redirect('/tutor/question.html?message=Question not found.&type=error');
    }
    return res.redirect('/tutor/question.html?message=Question Deleted.&type=success');
    
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/question.html?message=Servererror.&type=error');
  }
};

exports.homework = async (req, res, pageType) => {
  try {
    const { homeworkId } = req.body;
    req.session.homeworkID = homeworkId;
    let targetPagePath = '/tutor/';
    
    if (pageType === "submission") {
      targetPagePath += 'submission.html';
    } else if (pageType === "score") {
      targetPagePath += 'score.html';
    } else if (pageType === "deadline") {
      targetPagePath += 'deadline.html';
    } else {
      targetPagePath += 'question.html';
    }
    
    return res.redirect(targetPagePath);
  } catch (error) {
    console.error(error);
  }
};



const openai = new OpenAI({
  apiKey: config.OPENAI_APIKEY, // Replace with your actual API key
});

exports.generateQuestions = async(req, res) => {
  const { topic, number } = req.body;

  try {
    const chatCompletion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: 'You are a question bank, giving practice exam questions to users, without latex.' },
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
};

exports.addHomework = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/addHomework.html?message=Invalid input.&type=error');
  }
  const {topicName, deadline, generatedQuestions } = req.body;

  let recipient = await findUser(req, res, "addHomework", req.session.recipientID, true);

  let homework = new Homework({
    tutor: req.session.user._id,
    student: recipient._id,
    posted: Date.now(),
    topicName: topicName,
    deadline: deadline,
  });
  await homework.save();


  if (generatedQuestions){
    const file = new HomeworkFile({
      homework: homework._id,
      originalname: generatedQuestions,
      isStudent: false,
      isText: true
    });
    await file.save();

  } else  if (req.file) {
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
  }
  
  return res.redirect('/tutor/viewHomework.html?message=Homework sent.&type=success');
};

exports.viewIndividualHomework = async(req, res) => {
  try {
    const homework = await Homework.findById(req.session.homeworkID); 
    res.json({ homework });
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/viewHomework.html?message=Failed to view homework.&type=error');
  }
};

exports.changeDeadline = async(req, res) => {
  const { deadline } = req.body;
  const homework = await Homework.findById(req.session.homeworkID); 
  homework.deadline = deadline;
  await homework.save();
  res.redirect('/tutor/viewHomework.html?message=Homework updated successfully.&type=success');
};

exports.changeScore = async(req, res) => {
  const { score } = req.body;
  if(score>100 || score<0){
    return res.redirect('/tutor/score.html?message=Score has to be between 0 and 100.&type=error');
  }
  const homework = await Homework.findById(req.session.homeworkID); 
  homework.score = score;
  await homework.save();
  res.redirect('/tutor/viewHomework.html?message=Homework updated successfully.&type=success');
};