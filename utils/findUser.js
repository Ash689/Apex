const tutorUser = require('../models/tutorUser');
const studentUser = require('../models/studentUser');
async function findUser(req, res, webName, para, reverse = false) {
    let targetPagePath = '';
    let user;
    if (req.session.user.role === "tutor"){
        targetPagePath += '/tutor/';
    } else {
        targetPagePath += '/student/';
    }

    targetPagePath += webName;
    try {
        if(req.session.user.role === "tutor"){
            if(reverse){
                user = await studentUser.findById(para);
            } else {
                user = await tutorUser.findById(para);
            }
        } else{
            if(reverse){
                user = await tutorUser.findById(para);
            } else {
                user = await studentUser.findById(para);
            }
        }
        if (!user) {
            targetPagePath += '.html?message=User not found.&type=error';
            res.redirect(targetPagePath);
            return null; // Return null to indicate user not found
        }
        return user;
    } catch (error) {
        console.error(error);
        targetPagePath += '.html?message=Server error.&type=error';
        res.redirect(targetPagePath);
        return null; // Return null to indicate a server error
    }
}

module.exports = findUser;