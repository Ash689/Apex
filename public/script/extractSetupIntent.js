

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const returnUrl = urlParams.get('return_page');

  if (returnUrl) {
    document.getElementById('return-btn').addEventListener('click', function() {
      window.location.href = `/student/${returnUrl}.html`;
    });
  }

  if (sessionId) {
    try {
      const response = await fetch('/student/updatePaymentMethod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();

      if (result.success) {
        messageElement.textContent = "Payment Confirmed and Updated";
      }
    } catch (error) {
      console.log(error);
    }
  }
});
