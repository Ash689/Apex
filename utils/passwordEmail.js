const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
});
  
  
async function sendResetEmail(userEmail, token) {
    const mailOptions = {
      from: process.env.EMAIL, // Replace with your email
      to: userEmail,
      subject: 'Password Reset',
      text: `Your password reset token is ${token}. It will expire in 15 mins.`,
      
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


module.exports = sendResetEmail;