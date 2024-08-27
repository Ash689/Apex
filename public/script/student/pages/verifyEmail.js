fetch('/student/getEmailVerify')
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
    window.location.href = '/student/login.html?message=Please log in.&type=error';
});