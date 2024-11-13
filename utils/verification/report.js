const nodemailer = require('nodemailer');
const {header, footer} = require('../emailStandardScript');
require('dotenv').config();

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

async function verifyReport(details) {
  let subject2 = (details.tutor ? 'Reported Student ' : 'Reported Tutor ') + '[' + details.topic + ']';
  const mailOptions = {
    from: process.env.EMAIL, 
    to: process.env.EMAIL2,
    subject: subject2,
    html: `
      ${header()}
      
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Account Profile</h2>
        <p><strong>${details.tutor ? 'Student: ' : 'Tutor: '} ID:</strong> ${details.receiver}</p>
        <p><strong>Content:</strong> ${details.topic}</p>
        <p><strong>Topics:</strong> ${details.content}</p>
        
        <h3 style="color: #dc143c; font-family: Arial, sans-serif;">Picture Details</h3>
        <p><strong>Filename:</strong> ${details.filename}</p>
        <p><strong>Original Name:</strong> ${details.originalname}</p>
        <p><strong>Mimetype:</strong> ${details.mimetype}</p>
        <p><strong>Size:</strong> ${details.size} KB</p>
        
        <h3 style="color: #dc143c; font-family: Arial, sans-serif;">Report Picture</h3>
        <img src="cid:ReportPicture" alt="Report Picture" style="width: 200px; height: auto;"/>

      </div>
      ${footer()}
    `,

    attachments: [
      {
        filename: details.originalname,
        path: details.filename,
        cid: 'ReportPicture'
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


module.exports = verifyReport;