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

async function updateBankEmail(details) {
  const mailOptions = {
    from: process.env.EMAIL, 
    to: process.env.EMAIL2,
    subject: 'Bank Details Update Link',
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


module.exports = updateBankEmail;