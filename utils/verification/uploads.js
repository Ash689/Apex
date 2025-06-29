const nodemailer = require('nodemailer');
require('dotenv').config();
const {header, footer} = require('../emailStandardScript');

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

async function verifyIDAdmin(details) {
  const mailOptions = {
    from: process.env.EMAIL, 
    to: process.env.EMAIL2,
    subject: 'Verify User',
    html: `
      ${await header()}
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
        
        <h3 style="color: #dc143c; font-family: Arial, sans-serif;">ID Picture</h3>
        <img src="cid:IDPicture" alt="ID Picture" style="width: 200px; height: auto;"/>
      ${await footer()}
    `,

    attachments: [
      {
        filename: details.originalname,
        path: details.filename,
        cid: 'IDPicture'
      }
    ]
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
    to:  process.env.EMAIL2,
    subject: 'Verify Profile Picture',
    html: `
      ${await header()}
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

        <h3 style="color: #dc143c; font-family: Arial, sans-serif;">Profile Picture</h3>
        <img src="cid:profilePicture" alt="Profile Picture" style="width: 200px; height: auto;"/>
      ${await footer()}
    `,
    attachments: [
      {
        filename: details.originalname,
        path: details.filename,
        cid: 'profilePicture'
      }
    ]
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