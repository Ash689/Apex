
function generateBookingHTML(booking, returnUrl){
    const launchButtonEnabled = enableLaunchButton(booking.date, booking.duration);
    return `
        ${!booking.studentConfirmed && !booking.paymentGiven? `
            Price: £${booking.price}
            <form action="/student/confirmLesson" method="POST">
                <select id="charity" name="charityChoice" class = "charity-choice" required>
                    <option value="" disabled selected>Select your charity</option>
                    <option value="redCross">Red Cross</option>
                    <option value="unicef">UNICEF</option>
                    <option value="wwf">World Wildlife Fund (WWF)</option>
                    <option value="ChildrenInNeed">Children in Need</option>
                </select>
                <input type="hidden" name="returnUrl" value="${returnUrl}">
                <input type="hidden" name="bookingId" value="${booking._id}">
                <button id = "checkout-btn" type="submit">Confirm</button>
            </form>
        ` : ''}

        ${!booking.studentConfirmed && booking.paymentGiven? `
            <form action="/student/confirmLesson" method="POST">
                <select id="charity" name="charityChoice" class = "charity-choice" required>
                    <option value="" disabled selected>Select your charity</option>
                    <option value="redCross">Red Cross</option>
                    <option value="unicef">UNICEF</option>
                    <option value="wwf">World Wildlife Fund (WWF)</option>
                    <option value="ChildrenInNeed">Children in Need</option>
                </select>
                <input type="hidden" name="returnUrl" value="${returnUrl}">
                <input type="hidden" name="bookingId" value="${booking._id}">
                <button id = "checkout-btn" type="submit">Confirm</button>
            </form>
        ` : ''}

        ${booking.studentConfirmed && !booking.paymentGiven ? `
            Price: £${booking.price}
            <button id = "checkout-btn-payment" type="submit">Pay for lesson</button>
        ` : ''}
        ${!booking.tutorConfirmed ? `
            Lesson to be confirmed by Tutor
            <form action="/cancelChanges" method="POST">
                <input type="hidden" name="returnUrl" value="${returnUrl}">
                <input type="hidden" name="bookingId" value="${booking._id}">
                <button type="submit" class="secondary-button">Cancel Changes</button>
            </form>
        ` : ''}
        ${booking.studentConfirmed && booking.tutorConfirmed && booking.paymentGiven ? `
            <form id = "launch-lesson-form" action="/student/launchLesson" method="POST">
                <input type="hidden" name="bookingId" value="${booking._id}">
                <button class="${launchButtonEnabled ? (booking.revisionSession ? 'tertiary-button' : '') : (booking.revisionSession ? 'disabled-button-revision' : 'disabled-button')} launch" 
                    type="submit" ${launchButtonEnabled ? '' : 'disabled'}>Launch
                </button>
            </form>
        ` : ''}
        <form action="/getBookingID" method="POST">
            <input type="hidden" name="bookingId" value="${booking._id}">
            <button type="submit" class="secondary-button">Edit Booking</button>
        </form>
    `;
}
