const nodemailer = require('nodemailer');
require('dotenv').config();
const {header, footer, button} = require('../emailStandardScript');
const Booking = require('../../models/booking');
const formatDate = require('../../utils/bookingDateFormat');

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
    let booking = await Booking.findById(bookingId);
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Payment taken - ${booking.tutorName.split(" ")[0]}`,
      html: `
        ${await header()}
          <h2 style="color: #dc143c; font-family: Arial, sans-serif;">Payment Processed - £${booking.price}</h2>
          <p> Booking with ${booking.tutorName.split(" ")[0]} at ${await formatDate(booking.date)} ${booking.time}, ${booking.subject}</p>
          ${await button("View Bookings", "student/viewBooking.html")}

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

async function paymentEmailTutor(recipientEmail, bookingId) {
  let booking = await Booking.findById(bookingId);
  const mailOptions = {
    from: process.env.EMAIL,
    to: recipientEmail,
    subject: `Lesson is a go! - ${booking.studentName.split(" ")[0]}`,
    html: `
      ${await header()}
        <h2 style="color: #dc143c; font-family: Arial, sans-serif;">${booking.studentName.split(" ")[0]}'s lesson has been confirmed by Apex Tuition! </h2>
        <p> Booking with ${booking.studentName.split(" ")[0]} at ${await formatDate(booking.date)} ${booking.time}, ${booking.subject}.</p>
        ${await button("View Bookings", "tutor/viewBooking.html")}
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

module.exports = {paymentEmailStudent, paymentEmailTutor};