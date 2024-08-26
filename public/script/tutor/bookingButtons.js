
function generateBookingHTML(booking, returnUrl){
    const launchButtonEnabled = enableLaunchButton(booking.date, booking.duration);
    return `
        ${!booking.tutorConfirmed ? `
            <form action="/tutor/confirmLesson" method="POST">
                <input type="hidden" name="returnUrl" value="${returnUrl}">
                <input type="hidden" name="bookingId" value="${booking._id}">
                <button type="submit">Confirm</button>
            </form>
        ` : ''}
        ${!booking.studentConfirmed ? `
            Lesson to be confirmed/paid by Student
            ${booking.zJoinUrl ? `
                <form action="/cancelChanges" method="POST">
                    <input type="hidden" name="returnUrl" value="${returnUrl}">
                    <input type="hidden" name="bookingId" value="${booking._id}">
                    <button type="submit" class="secondary-button">Cancel Changes</button>
                </form>
            `: ''}
        ` : ''}
        ${booking.studentConfirmed && booking.tutorConfirmed && booking.paymentGiven ? `
            <form id = "launch-lesson-form" action="/tutor/launchLesson" method="POST">
                <input type="hidden" name="bookingId" value="${booking._id}">
                    <button class="${launchButtonEnabled ? (booking.revisionSession ? 'tertiary-button' : '') : (booking.revisionSession ? 'disabled-button-revision' : 'disabled-button')} launch" 
                    type="submit" ${launchButtonEnabled ? '' : 'disabled'}>Launch</button>
            </form>
        ` : ''}
        <form action="/getBookingID" method="POST">
            <input type="hidden" name="bookingId" value="${booking._id}">
            <button type="submit" class="secondary-button">Edit Booking</button>
        </form>
    `;
}
