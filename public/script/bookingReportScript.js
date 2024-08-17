fetch('/tutor/getStudentProfileNotes')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const profileElement = document.getElementById('student-profile');
        const lessonDate = new Date(data.date);
        const options = { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        };
        const timeOptions = {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: 'UTC'
        };
        const formattedDate = lessonDate.toLocaleDateString('en-US', options);
        const formattedTime = lessonDate.toLocaleTimeString('en-US', timeOptions);

        profileElement.innerHTML = `
            <div class="profile-container">
                        <img id="P1" style="width: 200px" alt="${data.f_originalname}" src="/uploads/profileFiles/student/profilePicture/${data.f_filename}" alt="Profile Image">
                <div class="profile-info">
                    <h3>Name: ${data.studentName}</h3>
                    <p>Subject: ${data.subject}</p>
                    <p>Lesson Date: ${formattedDate}, ${formattedTime}</p>
                </div>
            </div>
        `;
    }
})
.catch(error => {
    messageElement.textContent = 'Failed to load profile.';
    messageElement.classList.add('error');
    console.error(error);
});