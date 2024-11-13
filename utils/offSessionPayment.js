require('dotenv').config();
const Booking = require('../models/booking');
const Charity = require('../models/charity');
const stripe = require('stripe')(process.env.STRIPE_TOKEN);
const studentUser = require('../models/studentUser');
const tutorUser = require('../models/tutorUser');
const {paymentEmailStudent, paymentEmailTutor} = require('./email/payment');

async function offSessionPayment(bookingId){
    let booking = await Booking.findById(bookingId);
    let applicationFeeAmount = Math.floor(booking.price*100 * 0.1);
    let tutorUser2 = await tutorUser.findById(booking.tutor._id);
    let user = await studentUser.findById(booking.student._id);


    const paymentIntent = await stripe.paymentIntents.create({
        amount: booking.price * 100,
        currency: 'gbp',
        customer: user.stripeAccount,
        payment_method: user.defaultPaymentMethod,
        off_session: true,
        confirm: true,
        transfer_data: {
            destination: tutorUser2.stripeAccount,
        },
        application_fee_amount: applicationFeeAmount,
    });

    if (paymentIntent.status === 'succeeded') {
        booking.stripeIntent = paymentIntent.id;
        booking.paymentGiven = true;
        await booking.save();

        let charity = await Charity.findOne({name: booking.charity});
        if (!charity){
            charity = new Charity({
                name: booking.charity,
            });
        }
        charity.currentAmount = booking.price*100*0.9*0.1;
        await charity.save();
        paymentEmailStudent(user.email, booking._id);
        paymentEmailTutor(user.email, booking._id);

        return "Payment completed";
    } else {
        return "Payment not processed";
    }
};


module.exports = offSessionPayment;