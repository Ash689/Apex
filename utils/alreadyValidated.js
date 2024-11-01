const studentUser = require('../models/studentUser');
const tutorUser = require('../models/tutorUser');

async function alreadyValidated(userId, userType, userPage){
    let user;

    if (userType == "tutor"){
        user = await tutorUser.findById(userId);
    } else {
        user = await studentUser.findById(userId);
    }

    switch(userPage){
        case "configBanking":
            if (userType == "tutor" && user.stripeAccount){
                return true;
            }
            break;
        case "verifyEmail":
            if (user.isEmailVerified){
                return true;
            }
            break;
        case "configProfile":
            if(user.postcode){
                return true;
            }
            break;
    }
    return false;
}


module.exports = alreadyValidated;