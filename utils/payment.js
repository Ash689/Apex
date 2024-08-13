
const Booking = require('../models/booking');

const stripe = require('stripe')(process.env.STRIPE_TOKEN)
async function getPriceObject(bookingPrice, bookingId){

    const price = await stripe.prices.create({
        currency: 'gbp',
        unit_amount: bookingPrice * 100,
        product_data: {
            name: 'Booking',
        },
    });
    return price.id;
};

async function payment(bookingId, returnUrl){
    let booking = await Booking.findById(bookingId);
    let priceId = await getPriceObject(booking.price, booking._id);
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `http://localhost:3000/student/${returnUrl}.html?message=Payment confirmed ${bookingId}.&type=success`,
        cancel_url: `http://localhost:3000/student/${returnUrl}.html?message=Payment unconfirmed.&type=error`,
    });

    booking.paymentGiven = true;
    await booking.save();

    return session.url;
};


module.exports = payment;