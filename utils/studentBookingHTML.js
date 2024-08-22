export function generateCommonHTML(booking) {
    return `
        ${!booking.studentConfirmed ? `
            Price: £${booking.price}
            <form action="/student/confirmLesson" method="POST">
                <input type="hidden" name="returnUrl" value="viewBooking">
                <input type="hidden" name="bookingId" value="${booking._id}">
                <button id = "checkout-btn" type="submit">Confirm</button>
            </form>
        ` : ''}

        ${booking.studentConfirmed && !booking.paymentGiven ? `
            Price: £${booking.price}
            <button id = "checkout-btn" type="submit">Pay for lesson</button>
        ` : ''}
        ${!booking.tutorConfirmed ? `
            Lesson to be confirmed by Tutor
            <form action="/cancelChanges" method="POST">
                <input type="hidden" name="returnUrl" value="viewBooking">
                <input type="hidden" name="bookingId" value="${booking._id}">
                <button type="submit" class="secondary-button">Cancel Changes</button>
            </form>
        ` : ''}
        ${booking.studentConfirmed && booking.tutorConfirmed && booking.paymentGiven ? `
            <form id = "launch-lesson-form" action="/student/launchLesson" method="POST">
                <input type="hidden" name="bookingId" value="${booking._id}">
                <button class="${disableLaunchButton ? (booking.revisionSession ? 'disabled-button-revision' : 'disabled-button') : (booking.revisionSession ? 'tertiary-button' : '')} launch" 
                    type="submit" ${disableLaunchButton ? 'disabled' : ''}>Launch
                </button>
            </form>
        ` : ''}
        <form action="/getBookingID" method="POST">
            <input type="hidden" name="bookingId" value="${booking._id}">
            <button type="submit" class="secondary-button">Edit Booking</button>
        </form>
    `;
        
}

  