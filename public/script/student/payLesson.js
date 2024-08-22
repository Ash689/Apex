function payLesson(booking, returnUrl){
    if (booking.studentConfirmed && !booking.paymentGiven){
        document.getElementById('checkout-btn').addEventListener('click', async () => {
            const response = await fetch('/student/payLesson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId: booking._id,
                    returnUrl: returnUrl
                }),
            });

            const session = await response.json();
            if (session.session === "Payment completed" || session.session === "Payment not processed"){                                    
                window.location.href = `/student/${returnUrl}.html?message=${session.session}.&type=success`;
            } else {
                window.location.href = session.session;
            }
        });
    }
}