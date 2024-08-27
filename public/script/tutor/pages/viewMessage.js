fetch('/tutor/getMessage')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const messages = data.messages;
        const profileElement = document.getElementById('read-message');
        if (messages.length === 0) {            
            const messageContent = document.createElement('div');
            messageContent.innerHTML = '<p>No messages found.</p>';
            profileElement.appendChild(messageContent);
        } else {
            messages.forEach(message => {
                const messageContainer = document.createElement('div');
                const messageContent = document.createElement('div');
                const createdAt = new Date(message.createdAt);
                const formattedDate = `${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`;
                
                messageContent.innerHTML = `
                    <h3>${message.content}</h3>
                `;
                if (message.filename){
                    const downloadLink = document.createElement('a');
                    downloadLink.href = `/uploads/messageFiles/${message.fromStudent ? 'student' : 'tutor' }/${message.filename}`;
                    downloadLink.textContent = `Download ${message.originalname}`;
                    downloadLink.download = message.originalname;
                    messageContent.appendChild(downloadLink);
                }
                messageContent.innerHTML += `
                    <p style="font-size: 12px">${formattedDate}</p>
                `;
                messageContent.classList.add('message-item');
                
                if (message.fromStudent) {
                    messageContainer.classList.add('left-message-container');
                } else {
                    messageContainer.classList.add('right-message-container');
                }
                
                messageContainer.appendChild(messageContent);
                profileElement.appendChild(messageContainer);
            });
        }
        profileElement.scrollTop = profileElement.scrollHeight;
    }
})
.catch(error => {
    messageElement.textContent = 'Failed to load messages.';
    messageElement.classList.add('error');
});


fetch('/getBookingProfile')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const profileElement = document.getElementById('student-profile');
        const profileImage = data.profileImage ? data.profileImage : '../images/P1.jpg';

        // Check if a lesson exists
        const lessonExists = data.lesson !== "";

        profileElement.innerHTML = `
            <div class="profile-container">
                <img id="P1" style="width: 200px" alt="${data.recipient.f_originalname}" src="/uploads/profileFiles/student/profilePicture/${data.recipient.isPictureVerified ? data.recipient.f_filename : 'TBC.jpg'}" alt="Profile Image">
                <div class="profile-info">
                    <h3>Name: ${data.recipient.fullName}</h3>
                    ${lessonExists ? `
                        <p>Subject: ${data.lesson.subject}</p>
                        <p>Lesson Plan: ${data.lesson.plan}</p>
                    ` : ''}
                    <form action="/tutor/report.html">
                        <h3><a href="#" onclick="this.closest('form').submit();">Got an issue with this student?</a></h3>
                    </form>
                </div>
            </div>

            <div class="button-container">
                <form action="/tutor/newBooking.html">
                    <button type="submit">New Booking</button>
                </form>
                <form action="/tutor/viewHomework.html">
                    <button class="secondary-button" type="submit">Homework</button>
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


fetch('/viewIndividualBookings')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const bookings = data.bookings;
        const bookingElement = document.getElementById('booking');
        if (bookings.length === 0 || !bookings) {
            bookingElement.innerHTML = '<p>No bookings found.</p>';
        } else {
            bookings.forEach(booking => {
                const individualBookingElement = document.createElement('div');
                individualBookingElement.classList.add('booking-item');
                const date = new Date(booking.date);
                const dateString = date.toISOString().split('T')[0];
                const formattedDate = formatDate(dateString);
                individualBookingElement.innerHTML = `
                    <p style = "font-size: 14px">${formattedDate}</p>
                    <p style = "font-size: 14px">${booking.time}</p>
                    ${!booking.revisionSession ? `<p style = "font-size: 12px">${booking.subject}</p>` : `<p style = "font-size: 12px">Revision Session</p>`}
                    ${generateBookingHTML(booking, "viewMessage")}
                `;
                bookingElement.appendChild(individualBookingElement);                        
            });
        }
    }
})
.catch(error => {
    console.error('Error fetching bookings:', error);
    messageElement.textContent = 'Failed to show bookings';
    messageElement.classList.add('error');
});