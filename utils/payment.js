const config = require('../config');
const Booking = require('../models/booking');
const stripe = require('stripe')(config.STRIPE_TOKEN);
const studentUser = require('../models/studentUser');
const tutorUser = require('../models/tutorUser');

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
            success_url: `${config.URL}/student/paymentConfirmation.html?session_id={CHECKOUT_SESSION_ID}&return_page=${returnUrl}`,
            cancel_url: `${config.URL}/student/${returnUrl}.html?message=Payment unconfirmed.&type=error`,
        });

        return session.url;
    } else {

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
            return "Payment completed";
        } else {
        return "Payment not processed";
        }
    
    }
};


module.exports = payment;