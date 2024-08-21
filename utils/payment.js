
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
        user.stripeAccount = await stripe.customers.create({ email: user.email, name: user.fullName }).id;
        await user.save();
    }

    if (!user.defaultPaymentMethod) {
        // Create a Setup Intent if the user has no saved payment method
        let setupIntent = await stripe.setupIntents.create({
            customer: user.stripeAccount,
            payment_method_types: ['card'],
        });
    

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
            },
            success_url: `${process.env.URL}/student/${returnUrl}.html?message=Payment confirmed.&type=success&setup_intent=${setupIntent ? setupIntent.id : ''}`,
            cancel_url: `${process.env.URL}/student/${returnUrl}.html?message=Payment unconfirmed.&type=error`,
        });

        const paymentMethodId = setupIntent.payment_method;
        user.defaultPaymentMethod = paymentMethodId;
        await user.save();

        booking.paymentGiven = true;
        await booking.save();

        return session.url;
    } else {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: booking.price * 100, // Price in pennies
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
      
        return "Payment completed";
    }
};


module.exports = payment;