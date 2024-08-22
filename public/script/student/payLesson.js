function payLesson(confirmation){
    if (confirmation[0] === true && confirmation[2] === false){
        document.getElementById('checkout-btn').addEventListener('click', async () => {
            const response = await fetch('/student/payLesson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bookingId: confirmation[3],
                    returnUrl: "viewBooking"
                }),
            });

            const session = await response.json();
            if (session.session === "Payment completed"){                                    
                window.location.href = `/student/viewBooking.html?message=${session}.&type=success`;
            } else {
                window.location.href = session.session;
            }
        });
    }
}