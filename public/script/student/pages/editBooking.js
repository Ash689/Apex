fetch('/viewOneBooking')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const booking = data.booking;
        const dateElement = document.getElementById('bookingDate');
        const timeElement = document.getElementById('bookingTime');
        const subjectElement = document.getElementById('subject');
        const durationElement = document.getElementById('duration');
        if (booking) {
            const bookingDate = new Date(booking.date);
            const formattedDate = bookingDate.toISOString().split('T')[0];
            dateElement.value = formattedDate;
            timeElement.value = booking.time;
            subjectElement.value = booking.subject;  
            durationElement.value = booking.duration;
            if(booking.recurringID !== null){        
                const recurringElement = document.getElementById('recurring');                  
                recurringElement.innerHTML = `
                    <form action="/cancelRecurringBooking" method="POST">
                        <button type="submit">Cancel all lessons onward</button>
                    </form>
                `;
            }

        } else {
            messageElement.textContent = 'Booking not found.';
            messageElement.classList.add('error');
        }
    }
})
.catch(error => {
    console.error(error);
    messageElement.textContent = 'Failed to show bookings';
    messageElement.classList.add('error');
});