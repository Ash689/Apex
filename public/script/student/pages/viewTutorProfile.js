fetch('/student/viewProfile')
.then(response => response.json())
.then(data => {
    const messageElement = document.getElementById('message');

    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const profileElement = document.getElementById('profile');
        profileElement.innerHTML = `
            <img id="P1" alt="${data.f_originalname}" src="/uploads/profileFiles/tutor/profilePicture/${data.f_filename}" alt="Profile Image">
            <h3>Name: ${data.fullName}</h3>
        `;

        profileElement.innerHTML += `
            <p>${data.tuitionType}</p>
        `;

        data.subjects.forEach(subject => {
            const subjectElement = document.createElement('div');
            subjectElement.classList.add('profile-bar2');
            subjectElement.innerHTML = `
                <p>${subject.examBoard} ${subject.qualification} ${subject.subject}</p>
                <p>${subject.learningApproach}</p>
            `;
            profileElement.appendChild(subjectElement);
        });

        // Days available section
        const daysElement = document.createElement('div');
        daysElement.style.display = 'flex';
        data.daysAvailable.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.classList.add('profile-bar2');
            dayElement.innerHTML = `<p>${day.day}</p>`;
            daysElement.appendChild(dayElement);
        });
        profileElement.appendChild(daysElement);

        const profileMessageElement = document.getElementById('profileMessage');
        profileMessageElement.innerHTML = `
            <form action="/student/getID" method="POST">
                <input type="hidden" name="recipientEmail" value="${data._id}">
                <button type="submit">Message</button>
            </form>
        `;

        const profile2Element = document.getElementById('profile2');
        profile2Element.innerHTML = `
            <p>Current price:</p>
            <h3>£${data.price}</h3>
        `;

        const profile3Element = document.getElementById('profile3');
        if (data.reviews && data.reviews.length > 0) {
            profile3Element.innerHTML = `
                <div class="review-count">
                    <p>Review Count:</p>
                    <h3>${data.reviewCount} Reviews!</h3>
                </div>
                <div class="review-list">
                    <div class="review-list-inner"></div>
                </div>
            `;
            const reviewListInner = profile3Element.querySelector('.review-list-inner');
            data.reviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.classList.add('review');
                reviewElement.innerHTML = `
                    <p><strong>Score:</strong> ${review.reviewScore}</p>
                    <p><strong>Review:</strong> ${review.text}</p>
                    <p><strong>Date:</strong> ${new Date(review.date).toLocaleDateString()}</p>
                `;
                reviewListInner.appendChild(reviewElement);
            });
        } else {
            profile3Element.innerHTML = `
                <div class="review-count">
                    <p>Review Count:</p>
                    <h3>No Reviews Yet</h3>
                </div>
            `;
        }

        const profile6Element = document.getElementById('profile6');
        profile6Element.innerHTML = `
            <p>Lessons Complete:</p>
            <h3>${data.lessonCount} lessons done!</h3>
        `;

        const profile7Element = document.getElementById('profile7');
        profile7Element.innerHTML = `
            <p>Revision Sessions Complete:</p>
            <h3>${data.revisionCount} sessions done!</h3>
        `;
    }
})
.catch(error => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Failed to load profile.';
    messageElement.classList.add('error');
    console.error('Error fetching profile:', error);
});