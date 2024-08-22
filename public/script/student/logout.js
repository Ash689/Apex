const logoutButton = document.getElementById('logout-button');
logoutButton.style.display = 'inline-block'; // Show the button

logoutButton.addEventListener('click', function() {
    window.location.href = '/student/logout';
});