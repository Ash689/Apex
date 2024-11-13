// updateTutors.js
require('dotenv').config(); // Add this line at the top
const mongoose = require('mongoose');
const Message = require('./models/booking');
const Stripe = require('stripe');
const stripe = Stripe('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'); // Use your Stripe secret key


async function updateStuff() {
  // MongoDB Connection
  // await mongoose.connect(process.env.MONGODB_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  // });
  
  // await Message.updateMany({}, { $set: { 

  //   cancelled: false, 

  // }});

  await stripe.accounts.del('acct_1QD4ADQ36IS4F0j0');

  console.log('User deleted from Stripe successfully');
  
  await mongoose.disconnect();
}

updateStuff().catch(err => console.error(err));