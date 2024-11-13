const nodemailer = require('nodemailer');
require('dotenv').config();
const {header, footer, button} = require('../emailStandardScript');
const Booking = require('../../models/booking');

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
  
  
async function paymentEmailStudent(recipientEmail, bookingId) {
    let booking = Booking.findById(bookingId);
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Payment taken - ${booking.tutorName}`,
      html: `
        ${header()}

        
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Payment Processed - £${booking.price}</h2>
          <p> Booking with ${booking.tutorName} at ${booking.date}, ${booking.subject}</p>
          ${button("View Bookings", "student/viewBooking.html")}
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

async function paymentEmailTutor(recipientEmail, bookingId) {
  let booking = Booking.findById(bookingId);
  const mailOptions = {
    from: process.env.EMAIL,
    to: recipientEmail,
    subject: `Lesson is a go! - ${booking.studentName}`,
    html: `
      ${header()}

      
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc143c; font-family: Arial, sans-serif;">${booking.studentName}'s lesson has been confirmed by Apex Tuition! </h2>
        <p> Booking with ${booking.student} at ${booking.date}, ${booking.subject}.</p>
        ${button("View Bookings", "tutor/viewBooking.html")}
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

module.exports = {paymentEmailStudent, paymentEmailTutor};