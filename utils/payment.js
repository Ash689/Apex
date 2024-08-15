
const Booking = require('../models/booking');
const findUser = require('../utils/findUser');
const stripe = require('stripe')(process.env.STRIPE_TOKEN);

async function getPriceObject(bookingPrice, bookingId){
    let booking = await Booking.findById(bookingId);
    let product_data = `${booking.revisionSession ? 'Revision Session' : 'Tutoring Lesson'} with ${booking.tutorName}`;
    const price = await stripe.prices.create({
        currency: 'gbp',
        unit_amount: bookingPrice * 100,
        product_data: {
            name: product_data,
        },
    });
    return price.id;
};

async function payment(bookingId, returnUrl){
    let booking = await Booking.findById(bookingId);
    let priceId = await getPriceObject(booking.price, booking._id);
    let applicationFeeAmount = Math.floor(booking.price*100 * 0.1);
    let tutorUser = await findUser(req, res, "configBanking", booking.tutor, true);
    let user = await findUser(req, res, "configBanking", req.session.user._id);

    let customer = user.stripeAccount ? user.stripeAccount : await stripe.customers.create({ email: user.email });
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        customer: customer.id,
        payment_intent_data: {
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
                destination: tutorUser.stripeAccountId,
            },
            setup_future_usage: 'off-session',
        },
        mode: 'payment',
        success_url: `http://localhost:3000/student/${returnUrl}.html?message=Payment confirmed ${bookingId}.&type=success`,
        cancel_url: `http://localhost:3000/student/${returnUrl}.html?message=Payment unconfirmed.&type=error`,
    });
    user.stripeAccount = customer;
    await user.save();

    booking.paymentGiven = true;
    await booking.save();

    return session.url;
};


module.exports = payment;