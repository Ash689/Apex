fetch('/student/getTutorProfile2')
.then(response => response.json())
.then(data => {
    const messageElement = document.getElementById('message');
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const profileElement = document.getElementById('tutor-profile');
        const profileImage = data.profileImage ? data.profileImage : '../images/P1.jpg';

        // Building the subjects and qualifications string
        const subjectsAndQualifications = data.recipient.subjects.map(subject => 
            `${subject.subject} (${subject.qualification})`
        ).join(', ');

        // Check if lesson exists
        const lessonExists = data.lesson !== "";

        // Building the profile info
        const profileInfo = `
            <form action="/student/findTutorProfile" method="POST">
                <input type="hidden" name="recipientEmail" value="${data.recipient._id}">
                <h3>Name: <a href="#" onclick="this.closest('form').submit();">${data.recipient.fullName}</a></h3>
            </form>
            ${lessonExists ? `<p>Subject: ${data.lesson.subject}</p><p>Lesson Plan: ${data.lesson.plan}</p>` : `<p>Subjects: ${subjectsAndQualifications}</p>`}
        `;

        profileElement.innerHTML = `
            <div style="display:flex;" class="profile-container">
                <img id="P1" style="width: 200px" alt="${data.recipient.f_originalname}" src="/uploads/profileFiles/tutor/profilePicture/${data.recipient.isPictureVerified ? data.recipient.f_filename: 'TBC.jpg'}" alt="Profile Image">
                <div style="padding-left: 20px" class="profile-info">
                    ${profileInfo}
                </div>
            </div>
        `;
    }
})
.catch(error => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Failed to load profile.';
    messageElement.classList.add('error');
    console.error(error);
});