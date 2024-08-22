function launchLesson(booking){
    if (booking.studentConfirmed && booking.tutorConfirmed && booking.paymentGiven){
        document.getElementById('launch-lesson-form').addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            fetch('/student/launchLesson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bookingId: booking._id })
            })
            .then(response => response.json())
            .then(data => {
                if (data.zoomUrl) {
                    const notesWindow = window.open('/student/newReview.html', '_blank');

                    if (!notesWindow || notesWindow.closed || typeof notesWindow.closed == 'undefined') { 
                        alert("Pop-up blocked! Please allow pop-ups for this site.");
                    }

                    window.location.href = `${data.zoomUrl}`;
                } else {
                    messageElement.textContent = 'Error configuring zoom meeting';
                    messageElement.classList.remove('success');
                    messageElement.classList.add('error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                messageElement.textContent = 'Failed to load messages.';
                messageElement.classList.add('error');
            });
        });
    }
}