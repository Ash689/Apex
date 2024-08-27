fetch('/getBookingProfile')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const profileElement = document.getElementById('student-profile');
        const profileImage = data.profileImage ? data.profileImage : '../images/P1.jpg';
        const studentName = document.getElementById("reportName")
        studentName.innerHTML = `
            <p>You are making a report on the student: ${data.recipient.fullName}</p>
        `;

        profileElement.innerHTML = `
            <div class="profile-container">
                <img id="P1" style="width: 200px" alt="${data.recipient.f_originalname}" src="/uploads/profileFiles/student/profilePicture/${data.recipient.isPictureVerified ? data.recipient.f_filename: 'TBC.jpg'}" alt="Profile Image">
                <form action="/tutor/getID" method="POST">
                    <input type="hidden" name="recipientEmail" value="${data.recipient._id}">
                    <div class="profile-info">
                        <h3>Name: <a href="#" onclick="this.closest('form').submit();">${data.recipient.fullName}</a></h3>
                    </div>
                </form>
            </div>


        `;
    }
})
.catch(error => {
    messageElement.textContent = 'Failed to load profile.';
    messageElement.classList.add('error');
    console.error(error);
});