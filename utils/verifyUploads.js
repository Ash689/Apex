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

async function verifyIDAdmin(details) {
  const mailOptions = {
    from: process.env.EMAIL, 
    to: process.env.EMAIL,
    subject: 'Verify User ID',
    html: `
      <div style="background-color: #ffffff; border-bottom: 2px solid #cccccc; text-align: center; width: 100%; max-width: 600px; margin: 0 auto;">
        <h1 style="font-family: Arial, sans-serif; font-size: 36px; color: #dc143c; margin: 20px 0;">Apex Tuition</h1>
      </div>
      
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc143c; font-family: Arial, sans-serif;">User Profile</h2>
        <p><strong>ID:</strong> ${details._id}</p>
        <p><strong>Name:</strong> ${details.fullName}</p>
        <p><strong>Number:</strong> ${details.number}</p>
        <p><strong>Email:</strong> ${details.email}</p>
        <p><strong>Tutor:</strong> ${details.isTutor ? "Yes" : "No"}</p>
        
        <h3 style="color: #dc143c; font-family: Arial, sans-serif;">ID Details</h3>
        <p><strong>Filename:</strong> ${details.filename}</p>
        <p><strong>Original Name:</strong> ${details.originalname}</p>
        <p><strong>Mimetype:</strong> ${details.mimetype}</p>
        <p><strong>Size:</strong> ${details.size} KB</p>

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


async function verifyProfilePicAdmin(details) {
  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: 'Verify Profile Picture',
    html: `
    <div style="background-color: #ffffff; border-bottom: 2px solid #cccccc; text-align: center; width: 100%; max-width: 600px; margin: 0 auto;">
      <h1 style="font-family: Arial, sans-serif; font-size: 36px; color: #dc143c; margin: 20px 0;">Apex Tuition</h1>
    </div>
    
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc143c; font-family: Arial, sans-serif;">User Profile</h2>
      <p><strong>ID:</strong> ${details._id}</p>
      <p><strong>Name:</strong> ${details.fullName}</p>
      <p><strong>Number:</strong> ${details.number}</p>
      <p><strong>Email:</strong> ${details.email}</p>
      <p><strong>Tutor:</strong> ${details.isTutor ? "Yes" : "No"}</p>
      
      <h3 style="color: #dc143c; font-family: Arial, sans-serif;">ID Details</h3>
      <p><strong>Filename:</strong> ${details.filename}</p>
      <p><strong>Original Name:</strong> ${details.originalname}</p>
      <p><strong>Mimetype:</strong> ${details.mimetype}</p>
      <p><strong>Size:</strong> ${details.size} KB</p>

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

module.exports = {verifyIDAdmin, verifyProfilePicAdmin};