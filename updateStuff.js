// updateTutors.js
require('dotenv').config(); // Add this line at the top
const mongoose = require('mongoose');
const Message = require('./models/tutorUser');

async function updateStuff() {
  // MongoDB Connection
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  await Message.updateMany({}, { $set: { 

    postcode: "ASlj", 

  }});

  console.log('All messages updated with read field');
  
  await mongoose.disconnect();
}

updateStuff().catch(err => console.error(err));