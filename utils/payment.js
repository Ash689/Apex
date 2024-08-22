
const Booking = require('../models/booking');
const stripe = require('stripe')(process.env.STRIPE_TOKEN);
const studentUser = require('../models/studentUser');
const tutorUser = require('../models/tutorUser');
require('dotenv').config();

async function payment(bookingId, returnUrl){
    let booking = await Booking.findById(bookingId);
    let applicationFeeAmount = Math.floor(booking.price*100 * 0.1);
    let tutorUser2 = await tutorUser.findById(booking.tutor._id);
    let user = await studentUser.findById(booking.student._id);
    if (!user.stripeAccount){
        let account = await stripe.customers.create({ email: user.email, name: user.fullName });
        user.stripeAccount = account.id; 
        await user.save();
    }

    if (!user.defaultPaymentMethod) { 

        const session = await stripe.checkout.sessions.create({
            customer: user.stripeAccount,
            payment_method_types: ['card'],
            line_items: [
            {
                price_data: {
                currency: 'gbp',
                product_data: {
                    name: 'Lesson Payment',
                },
                unit_amount: booking.price*100
                },
                quantity: 1,
            },
            ],
            mode: 'payment',
            payment_intent_data: {
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: tutorUser2.stripeAccount, // The tutor's Stripe account ID
                },
                setup_future_usage: 'off_session',
            },
            success_url: `${process.env.URL}/student/${returnUrl}.html?message=Payment confirmed, please refresh the page.&type=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL}/student/${returnUrl}.html?message=Payment unconfirmed.&type=error`,
        });
        booking.stripeSession = session.id;
        await booking.save();

        return session.url;
    } else {
        const paymentMethod = await stripe.paymentMethods.attach(
            user.defaultPaymentMethod,
            { customer: user.stripeAccount }
        );

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
        booking.paymentGiven = true;
        await booking.save();
    
        return "Payment completed";
    }
};


module.exports = payment;