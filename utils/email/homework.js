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
  
  
async function sendHomeworkEmail(recipientEmail, topic, recipientName, senderName, deadline) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Homework Sent - ${senderName}`,
      html: `
        ${header()}

        
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
          <p>${recipientName},</p> 
          <p><strong>New homework sent from ${senderName}</strong></p>
          <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Topic: ${topic}</h2>
          <p><strong>Homework deadline: ${deadline}</strong></p>
          
          ${button("View Homework", "student/viewHomework.html")}
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

async function sendSubmissionEmail(recipientEmail, topic, recipientName, senderName, deadline) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: recipientEmail,
    subject: `Submission Given - ${senderName}`,
    html: `
      <div style="background-color: #ffffff; border-bottom: 2px solid #cccccc; text-align: center; width: 100%; max-width: 600px; margin: 0 auto;">
        <h1 style="font-family: Arial, sans-serif; font-size: 36px; color: #dc143c; margin: 20px 0;">Apex Tuition</h1>
      </div>

      
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
        <p>${recipientName},</p> 
        <p><strong>New homework submission sent from ${senderName}</strong></p>
        <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Topic: ${topic}</h2>
        <p><strong>Homework deadline: ${deadline}</strong></p>
        <footer style="margin-top: 20px; font-size: 14px; color: #888;">
          <p>Apex Tuition</p>
        </footer>
      </div>
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