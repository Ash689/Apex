const tutorElement = document.getElementById('tutors');

fetch('/student/findTutors')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const tutors = data.tutors;

        // Clear the tutorElement content before adding new content
        tutorElement.innerHTML = '';

        // Display tutors
        if (tutors.length === 0) {
            const noTutorsMessage = document.createElement('p');
            noTutorsMessage.textContent = 'No tutors found for your subject.';
            tutorElement.appendChild(noTutorsMessage);
        } else {
            tutors.forEach(tutor => {
                const tutorContainer = document.createElement('div');
                tutorContainer.classList.add('tutorContainer');


                const tutorDiv = document.createElement('div');
                tutorDiv.classList.add('tutor');

                let subjectsHtml = tutor.subjects.map(subject => `
                    <p>${subject.examBoard} ${subject.qualification} ${subject.subject}</p>
                `).join('');

                subjectsHtml += `
                    <p>${tutor.tuitionType}</p>
                    <p>${tutor.lessonCount} lessons done </p>
                    <p>${tutor.reviewCount} reviews </p>
                `;

                const colorPad = document.createElement('div');
                colorPad.classList.add('findTutor-colour');

                function getColor(lessonCount) {
                    const colors = [
                        '#808080', // Common: Gray
                        '#008000', // Uncommon: Green
                        '#0000FF', // Rare: Blue
                        '#800080', // Epic: Purple
                        '#FFA500', // Legendary: Orange
                        '#dc143c'  // Mythic: Red
                    ];
                    // Determine which color index to use
                    const colorIndex = Math.min(Math.floor(lessonCount / 100), colors.length - 1);
                
                    return colors[colorIndex];
                }

                const backgroundColor = getColor(tutor.lessonCount);
                // tutorContainer.style.backgroundColor = backgroundColor;

                tutorDiv.innerHTML = `
                    <img id="P1" style = "width: 200px" class="tutorImage" alt="${tutor.f_originalname}" src="/uploads/profileFiles/tutor/profilePicture/${tutor.isPictureVerified ?  tutor.f_filename: 'TBC.jpg'}">
                    <div class="tutorInfo">
                        <h3 style = "color: ${backgroundColor}">${tutor.fullName}</h3>
                        <h3>£${tutor.price}</h3>
                        ${subjectsHtml}
                    </div>
                    <div class="tutorActions">
                        <form action="/student/findTutorProfile" method="POST">
                            <input type="hidden" name="recipientEmail" value="${tutor._id}">
                            <button class = "secondary-button" type="submit" class="btn">View Profile</button>
                        </form>
                        <form action="/student/getID" method="POST">
                            <input type="hidden" name="recipientEmail" value="${tutor._id}">
                            <button class = "secondary-button" type="submit" class="btn">Message</button>
                        </form>
                    </div>
                `;
                tutorContainer.appendChild(tutorDiv);
                tutorContainer.appendChild(colorPad);
                tutorElement.appendChild(tutorContainer);
            });
        }
    }
})
.catch(error => {
    messageElement.textContent = 'Failed to load tutors.';
    messageElement.classList.add('error');
});