// config.js
const config = {
    PORT: process.env.PORT,
    MONGODB_URI:process.env.MONGODB_URI,
    SESSION_SECRET: process.env.SESSION_SECRET,
    OPENAI_APIKEY: process.env.OPENAI_APIKEY,
    ZOOM_CLIENTID: process.env.ZOOM_CLIENTID,
    ZOOM_CLIENTSECRET: process.env.ZOOM_CLIENTSECRET,
    ZOOM_ACCOUNTID: process.env.ZOOM_ACCOUNTID,
    SALT: process.env.SALT,
    EMAIL: process.env.EMAIL,
    EMAIL2: process.env.EMAIL2,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    STRIPE_TOKEN: process.env.STRIPE_TOKEN,
    URL: process.env.URL,
    GETADDRESS_URI: process.env.GETADDRESS_URI,
    BUSINESS_NUMBER: process.env.BUSINESS_NUMBER,
};
  
module.exports = config;