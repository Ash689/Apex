document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const setupIntentId = urlParams.get('setup_intent');
    

    if (setupIntentId) {
        
        messageElement.textContent = setupIntentId;
        
      try {
        const response = await fetch('/student/updatePaymentMethod', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ setupIntentId }),
        });
        const result = await response.json();
        if (result.success) {
          console.log('Payment method updated successfully');
          
        } else {
            console.error('Failed to update payment method');
        }
      } catch (error) {
        console.error('Error updating payment method:', error);
      }
    }
});