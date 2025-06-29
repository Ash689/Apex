const bookingTableBody = document.getElementById('bookings');


fetch('/tutor/apiprofile')
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
            <form action="/tutor/changePic" method="POST" enctype="multipart/form-data">
                <input id="profile-image" type="file" name="profile-photo" accept="image/*">
                <button id = "imageSubmitBtn" type="submit" class="secondary-button" disabled>Update Picture</button>
            </form>
            <h3>Name: ${data.fullName}</h3>
            <p>Email: ${data.email}</p>
        `;  

        profileElement.innerHTML += `
            <form action="/tutor/changeAvailability" method="POST">
                <button class="secondary-button" type="submit">${data.isAvailable? "Can't take on any more students? Click here" : "Boost Profile"}</button>
            </form>
        `;

        data.subjects.forEach(subject => {
            const subjectElement = document.createElement('div');
            subjectElement.classList.add('profile-bar2');
            subjectElement.innerHTML = `
                <p>${subject.examBoard} ${subject.qualification} ${subject.subject}</p>
            `;
            profileElement.appendChild(subjectElement);
        });

        // Add/Edit Subjects button
        profileElement.innerHTML += `
            <form action="/tutor/configSubject.html" method="GET">
                <button class="secondary-button" type="submit">Add/Edit Subjects</button>
            </form>
        `;

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

        // Add/Edit Days button
        profileElement.innerHTML += `
            <form action="/tutor/configDays.html" method="GET">
                <button class="secondary-button" type="submit">Add/Edit Days</button>
            </form>
        `;

        profileElement.innerHTML += `
            <form action="/tutor/changeTuitionType" method="POST">                        
                <input type="text" id="tuitionType" name="newTuitionType" minlength="10" maxlength="100" value="${data.tuitionType}">
                <button id = "tm-submitBtn" class="secondary-button" type="submit" disabled>Update Teaching Method</button>
            </form>
        `;

        profileElement.innerHTML += `
            <form action="/tutor/updateStripeAccount" method="GET">                        
                <button class="secondary-button" type="submit">Update Bank Details</button>
            </form>
        `;

        const profile2Element = document.getElementById('profile2');
        profile2Element.innerHTML = `
            <p>Current price:</p>
            <form action="/tutor/changePrice" method="POST">
                <input id="price" type="number" step="0.01" name="newPrice" value="${data.price}">
                <button class="secondary-button" type="submit">Update Price</button>
            </form>
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
                    <p><em>${review.text}</em></p>
                    <p style = "font-size: 12px; text-align: left;">${new Date(review.date).toLocaleDateString()}</p>
                    
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




fetch('/viewDayBookings')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const bookings = data.bookings;
        if (bookings.length === 0) {
            bookingTableBody.innerHTML = '<tr><td colspan="6">No bookings today.</td></tr>';
        } else {
            const dateRow = document.createElement('tr');
            dateRow.innerHTML = `<td colspan="5" style="font-weight: bold; background-color: #f2f2f2;">Today's Bookings:</td>`;
            bookingTableBody.appendChild(dateRow);
            

            bookings.forEach(booking => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td>                                    
                        <form action="/getBookingID2" method="POST">
                            <input type="hidden" name="bookingId" value="${booking._id}">
                            <a href="#" onclick="this.closest('form').submit();" style="font-style: italic; text-decoration: none;">${booking.studentName}</a>
                        </form>
                    </td>
                    <td>${booking.time}</td>
                    <td>
                        ${!booking.revisionSession ? `
                            ${booking.subject}
                        ` : 'Revision Session'}
                    </td>
                    <td>
                        ${generateBookingHTML(booking, "home")}
                        
                    </td>
                `;
                bookingTableBody.appendChild(row);
            });
        }
    }
})
.catch(error => {
    console.error('Error fetching bookings:', error);
    messageElement.textContent = 'Failed to show bookings';
    messageElement.classList.add('error');
});