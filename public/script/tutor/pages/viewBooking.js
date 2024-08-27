const bookingTableBody = document.getElementById('bookings');

fetch('/viewBookings')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const bookings = data.bookings;
        if (bookings.length === 0) {
            bookingTableBody.innerHTML = '<tr><td colspan="6">No bookings found.</td></tr>';
        } else {
            // Group bookings by date
            let groupedBookings = {};
            bookings.forEach(booking => {
                const date = new Date(booking.date);
                const dateString = date.toISOString().split('T')[0]; // Get the date part in YYYY-MM-DD format
                if (!groupedBookings[dateString]) {
                    groupedBookings[dateString] = [];
                }
                groupedBookings[dateString].push(booking);
            });

            // Render grouped bookings
            Object.keys(groupedBookings).forEach(date => {
                const formattedDate = formatDate(date);
                const dateRow = document.createElement('tr');
                dateRow.innerHTML = `<td colspan="6" style="font-weight: bold; background-color: #efefef;">${formattedDate}</td>`;
                bookingTableBody.appendChild(dateRow);

                groupedBookings[date].forEach(booking => {
                    const row = document.createElement('tr');
                    const profileImage = booking.student.filename ? `/uploads/profileFiles/student/profilePicture/${booking.student.filename}` : '../images/P1.jpg';

                    row.innerHTML = `
                        <td>                                    
                            <img style = "width:200px" src="${profileImage}" alt="Profile Image">
                            <form action="/getBookingID2" method="POST">
                                <input type="hidden" name="bookingId" value="${booking._id}">
                                <a href="#" onclick="this.closest('form').submit();" style="font-style: italic; text-decoration: none;">${booking.studentName}</a>
                            </form>
                        </td>
                        <td>${booking.time}</td>
                        <td> Duration: <br> ${booking.duration}minutes</td>
                        <td>${booking.subject}</td>
                        ${!booking.revisionSession ? `
                            <td>${booking.plan}</td>
                        ` : '<td>Revision Session</td>'}
                        <td>
                            ${generateBookingHTML(booking, "viewBooking")}
                        </td>
                    `;
                    

                    bookingTableBody.appendChild(row);                       
                });
            });
        }
    }
})
.catch(error => {
    console.error('Error fetching bookings:', error);
    messageElement.textContent = 'Failed to show bookings ' + error;
    messageElement.classList.add('error');
});