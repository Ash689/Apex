const studentUser = require('../models/studentUser');
const tutorUser = require('../models/tutorUser');

async function validationComplete(userId, userType){
    let user;
    let redirectUrl = null;

    if (userType == "tutor"){
        user = await tutorUser.findById(userId);
    } else {
        user = await studentUser.findById(userId);
    }

    if (!user.isEmailVerified){
        redirectUrl = 'sendVerification';
      } else {
        if (user.postcode) {
          if (!user.isIDVerified){
              redirectUrl = 'verifyID.html';
          } else {
            if (userType == "tutor" && !user.stripeAccount){
                redirectUrl = 'configBanking.html';
            } else {
              if (user.subjects.length === 0) {
                  redirectUrl = 'configSubject.html';
              }
            }
          }
        } else {
            redirectUrl = 'configProfile.html';
        }
    };
    return redirectUrl? `/${userType}/${redirectUrl}?access=denied`: null;
}


module.exports = validationComplete;