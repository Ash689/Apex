document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('access');

    if (accountId != "denied") {
        try {
            const response = await fetch('/tutor/alreadyValidated', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ page: "verifyEmail" }),
            });

            const data = await response.json();
            if (data.pageAvailable){
                window.location.href = "/error.html?access=denied";
            }

        } catch (error) {
            console.log(error);
        }
    }
});

fetch('/tutor/getEmailVerify')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        let emailPlaceholder = document.getElementById('txtEmail');
        emailPlaceholder.value = data.email;
    }
})
.catch(error => {
    console.error('Error:', error);
    window.location.href = '/tutor/login.html?message=Please log in.&type=error';
});