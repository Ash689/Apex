const bookingTableBody = document.getElementById('bookings');
fetch('/student/apiprofile')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const profileElement = document.getElementById('profile');
        profileElement.innerHTML = `
            <img id="P1" alt="${data.f_originalname}" src="/uploads/profileFiles/student/profilePicture/${data.f_filename}" alt="Profile Image">
            <form action="/student/changePic" method="POST" enctype="multipart/form-data">
                <input id="profile-image" type="file" name="profile-photo" accept="image/*">
                <button type="submit" id = "imageSubmitBtn" class = "secondary-button" disabled>Update Picture</button>
            </form>
            <h3>Name: ${data.fullName}</h3>
            <p>Email: ${data.email}</p>
        `;
        
        data.subjects.forEach(subject => {
            const subjectElement = document.createElement('div');
            subjectElement.classList.add('profile-bar2');
            subjectElement.innerHTML = `
                <p>${subject.examBoard} ${subject.qualification} ${subject.subject}</p>
            `;
            profileElement.appendChild(subjectElement);
        });

        profileElement.innerHTML += `
            <form action="/student/configSubject.html" method="GET">
                <button class ="secondary-button" type="submit">Add/Edit Subjects</button>
            </form>
        `;

        profileElement.innerHTML += `
            <div id = "clear">
                <button class = "secondary-button" id = "clear-btn">Clear Existing Bank Details</button>
            </div>
        `;
        document.getElementById('clear-btn').addEventListener('click', function() {
            document.getElementById('clear').innerHTML = `
                <form action="/student/clearBanking" method="GET">
                    <button type="submit">Confirm clearing of bank details?</button>
                </form>
            `;
        });

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
    messageElement.textContent = 'Failed to load profile.';
    messageElement.classList.add('error');
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
            dateRow.innerHTML = `<td colspan="5" style="font-weight: bold; background-color: #  ;">Today's Bookings:</td>`;
            bookingTableBody.appendChild(dateRow);

            bookings.forEach(booking => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>                                    
                        <form action="/getBookingID2" method="POST">
                            <input type="hidden" name="bookingId" value="${booking._id}">
                            <a href="#" onclick="this.closest('form').submit();" style="font-style: italic; text-decoration: none;">${booking.tutorName}</a>
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