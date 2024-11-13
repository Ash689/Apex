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
      subject: `New message ${senderName}`,
      html: `
        ${header()}

        
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
          <p>Hi ${recipientName},</p> 
          <p>New message from <strong>${recipientName}</strong></p>
          <h2 style="color: #dc143c; font-family: Arial, sans-serif;">${message}</h2>

          
          ${isStudent? button("View Messages", "student/viewMessenger.html"): button("View Messages", "tutor/viewMessenger.html")}
          <p> Ref: ${messageRef}</p>
        </div>
        ${footer()}
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