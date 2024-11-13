const nodemailer = require('nodemailer');
require('dotenv').config();
const {header, footer, button} = require('../emailStandardScript');
const formatDate = require('../../utils/bookingDateFormat');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
});
  
  
async function sendHomeworkEmail(recipientEmail, topic, recipientName, senderName, deadline) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Homework sent - ${senderName.split(" ")[0]}`,
      html: `
        ${await header()}
          <h2 style="color: #dc143c; font-family: Arial, sans-serif;">New homework sent from ${senderName.split(" ")[0]}</h2>
          <p><strong>Complete the homework on ${topic}.</strong></p>
          <p><strong>Homework deadline: ${await formatDate(deadline)}</strong></p>
          
          ${await button("View Homework", "student/viewHomework.html")}
        ${await footer()}
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
}

async function sendSubmissionEmail(recipientEmail, topic, recipientName, senderName, deadline) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: recipientEmail,
    subject: `Submission Given - ${senderName.split(" ")[0]}`,
    html: `

      ${await header()}

      
        <h2 style="color: #dc143c; font-family: Arial, sans-serif;">New homework submission sent from ${senderName.split(" ")[0]}</h2>
        <p><strong>Topic: ${topic}</strong></p>
        <p><strong>Homework deadline: ${await formatDate(deadline)}</strong></p>

        ${await button("View Homework", "tutor/viewHomework.html")}
      ${await footer()}
    `,
  };

  try {
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = {sendHomeworkEmail, sendSubmissionEmail};