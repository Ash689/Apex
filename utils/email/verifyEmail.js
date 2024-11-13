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
  
  
async function sendResetEmail(userEmail, token, isStudent) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: 'Password Reset',
      html: `
        ${await header()}
          <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Password Reset</h2>
          <p>Your password reset token is <strong>${token}</strong></p>
          ${isStudent? await button("Apex Tuition", "student/forgotPassword.html"): await button("Apex Tuition", "tutor/forgotPassword.html")}
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

async function sendVerifyEmail(userEmail, token) {
  const mailOptions = {
    from: process.env.EMAIL, // Replace with your email
    to: userEmail,
    subject: 'Apex Tuition Email Verification',
    text: `Your verification token is ${token}. It will expire in 15 mins.`,

    html: `
      ${await header()}
        <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Password Reset</h2>
        <p>Your verification token is: <strong>${token}</strong></p>
        ${await button("Apex Tuition", "welcome.html")}
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

module.exports = {sendResetEmail, sendVerifyEmail};