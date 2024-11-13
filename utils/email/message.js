const nodemailer = require('nodemailer');
require('dotenv').config();
const {header, footer, button} = require('../emailStandardScript');

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
  
  
async function sendMessageEmail(recipientEmail, message, recipientName, senderName, isStudent, messageRef) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `New message from ${senderName}`,
      html: `
        ${await header()}
          <p></strong></p>
          <h2 style="color: #dc143c; font-family: Arial, sans-serif;">New message from ${recipientName}</h2>
          <p><strong>${message}</strong></p>

          
          ${isStudent? await button("View Messages", "student/viewMessenger.html"): await button("View Messages", "tutor/viewMessenger.html")}
          <p> Ref: ${messageRef}</p>
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

module.exports = sendMessageEmail;