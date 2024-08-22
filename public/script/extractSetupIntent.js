document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

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
