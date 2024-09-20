const nodemailer = require('nodemailer');

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
  
  
async function sendResetEmail(userEmail, token) {
    const mailOptions = {
      from: process.env.EMAIL,
      to: userEmail,
      subject: 'Password Reset',
      html: `
        <div style="background-color: #ffffff; border-bottom: 2px solid #cccccc; text-align: center; width: 100%; max-width: 600px; margin: 0 auto;">
          <h1 style="font-family: Arial, sans-serif; font-size: 36px; color: #dc143c; margin: 20px 0;">Apex Tuition</h1>
        </div>
        
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Password Reset</h2>
          <p>Your password reset token is <strong>${token}</strong></p>

          <footer style="margin-top: 20px; font-size: 14px; color: #888;">
            <p>Best regards,<br/>Apex Tuition</p>
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

async function sendVerifyEmail(userEmail, token) {
  const mailOptions = {
    from: process.env.EMAIL, // Replace with your email
    to: userEmail,
    subject: 'Verify User',
    text: `Your verification token is ${token}. It will expire in 15 mins.`,

    html: `
      <div style="background-color: #ffffff; border-bottom: 2px solid #cccccc; text-align: center; width: 100%; max-width: 600px; margin: 0 auto;">
        <h1 style="font-family: Arial, sans-serif; font-size: 36px; color: #dc143c; margin: 20px 0;">Apex Tuition</h1>
      </div>
      
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Password Reset</h2>
        <p>Your verification token is: <strong>${token}</strong></p>

        <footer style="margin-top: 20px; font-size: 14px; color: #888;">
          <p>Best regards,<br/>Apex Tuition</p>
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

module.exports = {sendResetEmail, sendVerifyEmail};