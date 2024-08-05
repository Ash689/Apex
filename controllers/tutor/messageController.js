const { body, validationResult } = require('express-validator');
const findUser = require('../../utils/findUser'); // Assuming you have a utility function for this
const Message = require('../../models/message');
const studentUser= require('../../models/studentUser');

const Report = require('../../models/report');

exports.sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/tutor/viewMessage.html?message=Invalid input.&type=error');
  }
  const { content } = req.body;

  console.log(content);

  try{
    let recipient = await findUser(req, res, "viewMessage", req.session.recipientID, true);

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
    res.redirect('/tutor/viewMessage.html');
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/viewMessage.html?message=Failed to send message .&type=error');

  }
};

exports.getMessage = async (req, res) => {
  try{
    let recipient = await findUser(req, res, "viewMessage", req.session.recipientID, true);


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
    return res.redirect('/tutor/viewMessage.html?message=Server error.&type=error');
  }
};


exports.viewMessenger = async (req, res) => {
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
      .select('_id fullName subject email f_originalname f_filename')
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
        _id: recipient._id,
        fullName: recipient.fullName,
        subject: recipient.subjects,
        email: recipient.email,
        originalname: recipient.f_originalname,
        filename: recipient.f_filename,
        mostRecentMessage: recipientMessages[recipientId] ? recipientMessages[recipientId].content : "No messages yet"
      };
    });

    res.json({ recipients: recipientDetails });
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/viewMessenger.html?message=Failed to retrieve messages.&type=error');
  }
};

exports.sendReport = async(req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.redirect('/student/report.html?message=Invalid input.&type=error');
  }
  const { topics, content} = req.body;

  try {
    let recipient = await findUser(req, res, "report", req.session.recipientID, true);


    // Create a new message
    let report = new Report({
      sender: req.session.user._id,
      receiver: recipient._id,
      content: content,
      topic: topics,
    });

    if (req.file) {
        report.filename = req.file.filename;
        report.originalname = req.file.originalname;
        report.mimetype =  req.file.mimetype;
        report.size =  req.file.size;
    }

    // Save the message
    await report.save();
    res.redirect('/tutor/viewMessage.html?message=Report sent successfully, we shall review it and get back to you.&type=success');
  } catch (error) {
    console.error(error);
    return res.redirect('/tutor/report.html?message=Failed to send message .&type=error');
  }
};