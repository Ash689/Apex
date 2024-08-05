const findUser = require('../../utils/findUser'); // Assuming you have a utility function for this
const tutorUser = require('../../models/tutorUser');
const { body, validationResult } = require('express-validator');

exports.findTutors = async(req, res) => {
    try {
        // Fetch student profile using findUser function
        let student = await findUser(req, res, "findTutors", req.session.user._id);
  
        // Check if student or student.subjects is missing or undefined
        if (!student || !student.subjects) {
            return res.redirect('/student/findTutors.html?message=Student profile not found.&type=error');
        }
  
        // Extract subjects from student profile
        const subjects = student.subjects.map(subject => ({
            subject: subject.subject,
            qualification: subject.qualification,
            grade: subject.grade,
            learningApproach: subject.learningApproach,
            examBoard: subject.examBoard
        }));
  
        // Query tutors based on subjects and qualifications
        const tutors = await tutorUser.find({ 
            subjects: { 
                $elemMatch: { 
                    subject: { $in: subjects.map(s => s.subject) },
                    qualification: { $in: subjects.map(s => s.qualification) }
                }
            },
            isAvailable: true
        }).lean(); // Use lean() to get plain JS objects
  
        // Include matching subject details in each tutor object
        tutors.forEach(tutor => {
            tutor.subjects = tutor.subjects.filter(tutorSubject => 
                subjects.some(studentSubject => 
                    studentSubject.subject === tutorSubject.subject && 
                    studentSubject.qualification === tutorSubject.qualification));
        });
  
        // Return JSON response with subjects and tutors found
        res.json({ subjects, tutors });
    } catch (error) {
        console.error("Error finding tutors:", error);
        res.status(500).json({ error: 'Failed to find tutors.' });
    }
};

exports.findTutorProfile = async(req, res) => {
    try {
        const { recipientEmail } = req.body;
        req.session.recipientID = recipientEmail;
        res.redirect('/student/viewTutorProfile.html');
    
    } catch(error){
        console.error(error);
        return res.redirect('/student/viewTutorProfile.html?message=Server error.&type=error');
    }
};