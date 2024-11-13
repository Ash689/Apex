const nodemailer = require('nodemailer');
require('dotenv').config();
const {header, footer, button} = require('../emailStandardScript');
const Booking = require('../../models/booking');
const tempBookingData = require('../../models/tempBookingData');

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
      subject: `New ${booking.recurringID? "recurring": ""} booking request - ${booking.tutorName}`,
      html: `
        ${header()}        
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">

            <p>${booking.studentName},</p> 
            <p><strong>New booking request</strong></p>
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;">${booking.recurringID? "Recurring": ""} booking with ${booking.tutorName} at ${booking.date}, ${booking.subject}</h2>
            ${button("View Bookings", "/student/viewBooking.html")}
            <p> Ref: ${bookingId}</p>
        </div>
        ${footer()}
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
      subject: `Booking edited - ${toStudent? booking.tutorName: booking.studentName}`,
      html: `
        ${header()}

        
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
            <p>${toStudent? booking.studentName: booking.tutorName}</p>
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;"> Booking Edited: ${booking.tutorName} with ${booking.studentName}</h2>
            <p><strong>Original booking:</strong></p>
            <p>${tempBooking.subject}</p>
            <p>${tempBooking.date}</p>
            <p>${tempBooking.time}</p>
            <p>${tempBooking.duration}</p>
            <p>${tempBooking.price}</p>
        

            <p><strong>New booking:</strong></p>
            <p>${booking.subject}</p>
            <p>${booking.date}</p>
            <p>${booking.time}</p>
            <p>${booking.duration}</p>
            <p>${booking.price}</p>


            ${toStudent? button("Confirm Booking", "student/viewBooking.html"): button("Confirm Booking", "tutor/viewBooking.html")}
            <p> Ref: ${bookingId}</p>
        </div>
        ${footer()}
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
      subject: `Booking confirmed - ${toStudent? booking.tutorName: booking.studentName}`,
      html: `
        ${header()}

        
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;"> ${booking.recurringID? "Regular bookings confirmed": " Booking confirmed"}: ${booking.tutorName} with ${booking.studentName}</h2>
        
            <p>${booking.subject}</p>
            <p>Next lesson: ${booking.date} @ ${booking.time}</p>
            <p>${booking.duration}minutes</p>
            <p>${booking.price}</p>


            ${toStudent? button("View Bookings", "student/viewBooking.html"): button("View Bookings", "tutor/viewBooking.html")}
            <p> Ref: ${bookingId}</p>
        </div>
        ${footer()}
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
      subject: `Booking cancelled - ${date}`,
      html: `
        ${header()} 

        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;"> Booking cancelled with ${toStudent? booking.tutorName: booking.studentName} at ${booking.date}</h2>
            <p><strong>${toStudent? ( refund ? "Refund processed": ""): ""}</strong></p>
            ${toStudent? button("View Bookings", "student/viewBooking.html"): button("View Bookings", "tutor/viewBooking.html")}
            <p> Ref: ${bookingId}</p>
        </div>
        ${footer()}
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
      subject: `Recurring bookings cancelled - ${toStudent? booking.tutorName: booking.studentName}`,
      html: `
        ${header()} 

        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc143c; font-family: Arial, sans-serif;"> Booking cancelled with ${toStudent? booking.tutorName: booking.studentName}</h2>
            <p><strong>${toStudent? ( refund ? "Refunds processed": ""): ""}</strong></p>
            ${toStudent? button("View Bookings", "student/viewBooking.html"): button("View Bookings", "tutor/viewBooking.html")}
            <p> Ref: ${booking.recurringID}</p>
        </div>
        ${footer()}
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