const nodemailer = require('nodemailer');
require('dotenv').config();
const {header, footer, button} = require('../emailStandardScript');
const Booking = require('../../models/booking');
const tempBookingData = require('../../models/tempBookingData');
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

async function newBookingEmail(recipientEmail, bookingId) {
    const booking = await Booking.findById(bookingId);
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `New ${booking.recurringID? "recurring": ""} booking request - ${booking.tutorName.split(" ")[0]}`,
      html: `
        ${await header()}        
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;">New ${booking.recurringID? "Recurring": ""} Booking with ${booking.tutorName.split(" ")[0]}</h2>
            <p><strong>at ${ await formatDate(booking.date)} ${booking.time}, ${booking.subject}</strong></p>
            ${await button("View Bookings", "/student/viewBooking.html")}
            <p> Ref: ${bookingId}</p>
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

  
  
async function editBookingEmail(recipientEmail, bookingId, toStudent) {
    const booking = await Booking.findById(bookingId);
    const tempBooking = await tempBookingData.findOne({ booking: bookingId });
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Booking edited - ${toStudent? booking.tutorName.split(" ")[0]: booking.studentName.split(" ")[0]}`,
      html: `
        ${await header()}

            <h2 style="color: #dc143c; font-family: Arial, sans-serif;"> Booking Edited: ${booking.tutorName.split(" ")[0]} with ${booking.studentName.split(" ")[0]}</h2>
            <p><strong>Original booking:</strong></p>
            <p>Subject: ${tempBooking.subject}</p>
            <p>Date: ${await formatDate(tempBooking.date)} ${booking.time} for ${tempBooking.duration}minutes</p>
            <p>Price: ${tempBooking.price}</p>
            <br><br>
        

            <p><strong>New booking:</strong></p>
            <p>Subject: ${booking.subject}</p>
            <p>Date: ${await formatDate(booking.date)} ${booking.time} for ${booking.duration}minutes</p>
            <p>Price: ${booking.price}</p>


            ${toStudent? await button("Confirm Booking", "student/viewBooking.html"): await button("Confirm Booking", "tutor/viewBooking.html")}
            <p> Ref: ${bookingId}</p>
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

async function confirmBookingEmail(recipientEmail, bookingId, toStudent) {
    const booking = await Booking.findById(bookingId);
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Booking confirmed - ${toStudent? booking.tutorName.split(" ")[0]: booking.studentName.split(" ")[0]}`,
      html: `
        ${await header()}
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;"> ${booking.recurringID? "Regular bookings confirmed": " Booking confirmed"}: ${booking.tutorName.split(" ")[0]} with ${booking.studentName.split(" ")[0]}</h2>
        
            <p>${booking.subject}</p>
            <p>Next lesson: ${await formatDate(booking.date)} ${booking.time} for ${booking.duration}minutes</p>
            <p>Price: £${booking.price}</p>


            ${toStudent? await button("View Bookings", "student/viewBooking.html"): await button("View Bookings", "tutor/viewBooking.html")}
            <p> Ref: ${bookingId}</p>
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



async function cancelBookingEmail(recipientEmail, bookingId, toStudent, refund) {
    const booking = await Booking.findById(bookingId);
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Booking cancelled - ${await formatDate(booking.date)}`,
      html: `
        ${await header()} 
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;"> Booking cancelled with ${toStudent? booking.tutorName.split(" ")[0]: booking.studentName.split(" ")[0]} at ${await formatDate(booking.date)} ${booking.time}</h2>
            <p><strong>${toStudent? ( refund ? "Refund processed": ""): ""}</strong></p>
            ${toStudent? await button("View Bookings", "student/viewBooking.html"): await button("View Bookings", "tutor/viewBooking.html")}
            <p> Ref: ${bookingId}</p>
        </div>
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

async function cancelRecurringBookingEmail(recipientEmail, bookingId, toStudent, refund) {
    const booking = await Booking.findById(bookingId);
    const mailOptions = {
      from: process.env.EMAIL,
      to: recipientEmail,
      subject: `Recurring bookings cancelled - ${toStudent? booking.tutorName.split(" ")[0]: booking.studentName.split(" ")[0]}`,
      html: `
        ${await header()} 
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;"> Booking cancelled with ${toStudent? booking.tutorName.split(" ")[0]: booking.studentName.split(" ")[0]}, ${booking.subject}</h2>
            <p><strong>${toStudent? ( refund ? "Refunds processed": ""): ""}</strong></p>
            ${toStudent? await button("View Bookings", "student/viewBooking.html"): await button("View Bookings", "tutor/viewBooking.html")}
            <p> Ref: ${booking.recurringID}</p>
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


module.exports = {newBookingEmail, editBookingEmail, confirmBookingEmail,cancelBookingEmail, cancelRecurringBookingEmail};