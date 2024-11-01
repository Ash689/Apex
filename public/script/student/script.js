document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('access');

    if (accountId != "denied") {

        try {
            const response = await fetch('/student/validationComplete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({  }),
            });

            const data = await response.json();
            if (data.redirectUrl){
                window.location.href = data.redirectUrl;
            }

        } catch (error) {
            console.log(error);
        }
    }
});


fetch('/student/navbar.html')
.then(response => response.text())
.then(data => {
    // Insert the navbar HTML content
    document.getElementById('navbarStudent').innerHTML = data;
    // Get the current page URL
    const currentPage = window.location.href;

    // Get all the links in the navbar
    const navLinks = document.querySelectorAll('#navbarStudent nav a');
    const commonWords = ['Booking', 'Mess', 'home', 'Tutor'];
    // Loop through each link
    navLinks.forEach(link => {
        // Check if the link's href matches the current page URL
        commonWords.forEach(word => {
            if (currentPage.includes(word) && link.href.includes(word)) {
                // Add the 'current' class to the matching link
                link.classList.add('current');
            }
        })
    });
}).catch(error => console.error('Error loading the navbar:', error));

fetch('/student/countMessage')
.then(response => response.json())
.then(data => {
    if (data.error) {
        // Handle error case
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        if (data.count > 0){
            const messageCountElement = document.getElementById('messageCounter');
            if (data.count > 9){
                messageCountElement.innerHTML += "[*]";
            } else {
                
                messageCountElement.innerHTML += `[${data.count}]`;
            }
        }
    }
}).catch(error => {
    window.location.href = '/student/login.html?message=Please log in.&type=error';
});


document.addEventListener('DOMContentLoaded', () => {
    fetch('/student/userName')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Handle error case
            messageElement.textContent = data.error;
            messageElement.classList.add('error');
        } else {
            // Update welcome-message with user's full name
            const profileElement = document.getElementById('welcome-message');
            profileElement.innerHTML = `<h3>${data.fullName}</h3>`;
            profileElement.style.display = 'block'; // Ensure welcome-message is visible
        }

        // Show and configure logout button
        const logoutButton = document.getElementById('logout-button');
        logoutButton.style.display = 'inline-block'; // Show the button

        logoutButton.addEventListener('click', function() {
            window.location.href = '/student/logout';
        });
    })
    .catch(error => {
        window.location.href = '/student/login.html?message=Please log in.&type=error';
    });
});


