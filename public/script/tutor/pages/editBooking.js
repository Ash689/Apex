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
        const priceElement = document.getElementById('price');
        if (booking) {
            const bookingDate = new Date(booking.date);
            const formattedDate = bookingDate.toISOString().split('T')[0];
            dateElement.value = formattedDate;
            priceElement.value = booking.price;
            if (booking.paymentGiven) {priceElement.readOnly = true; priceElement.style = "color: grey"}

            timeElement.value = booking.time;
            subjectElement.value = booking.subject;  
            durationElement.value = booking.duration;
            if(booking.recurringID !== null){        
                const recurringElement = document.getElementById('recurring');                  
                recurringElement.innerHTML = `
                    <form action="/cancelRecurringBooking" method="POST">
                        <button type="submit" class="secondary-button" >Cancel all lessons onward</button>
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


document.getElementById('info-button').title = "Tutoring Lesson: Prices range from £10 to £40" + "\n" + "Revision Session: Prices range from £5 to £12" + "\n" + "Introduction Session: Free";