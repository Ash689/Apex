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
    text: `

    User profile:
    ${details._id}, \n
    ${details.fullName}, \n
    ${details.number},
    ${details.email},
    Tutor: ${details.isTutor}
    
    ID details:\n 
      ${details.filename},\n
      ${details.originalname},\n
      ${details.mimetype},\n 
      ${details.size},\n
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
    text: `

    User profile:
    ${details._id}, \n
    ${details.fullName}, \n
    ${details.number},
    ${details.email},
    Student: ${details.isTutor}
    
    ID details:\n 
      ${details.filename},\n
      ${details.originalname},\n
      ${details.mimetype},\n 
      ${details.size},\n
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