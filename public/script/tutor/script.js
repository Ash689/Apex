document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('access');

    if (accountId != "denied") {

        try {
            const response = await fetch('/tutor/validationComplete', {
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



fetch('/tutor/navbar.html')
.then(response => response.text())
.then(data => {
    // Insert the navbar HTML content
    document.getElementById('navbarTutor').innerHTML = data;
    // Get the current page URL
    const currentPage = window.location.href;

    // Get all the links in the navbar
    const navLinks = document.querySelectorAll('#navbarTutor nav a');
    const commonWords = ['Booking', 'Mess', 'home'];

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


document.addEventListener('DOMContentLoaded', () => {
    fetch('/tutor/userName')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            // Handle error case
            messageElement.textContent = data.error;
            messageElement.classList.add('error');
        } else {
            const profileElement = document.getElementById('welcome-message');
            profileElement.innerHTML = `<h3>${data.fullName}</h3>`;
            profileElement.style.display = 'block';
            if(document.getElementById('newPrice')){
                const priceElement = document.getElementById('newPrice');
                priceElement.value = data.price;
            }
            
            function getColor(lessonCount) {
                const colors = [
                    '#8080807a',
                    '#0080007a',
                    '#0000FF7a',
                    '#8000807a',
                    '#FFA5007a',
                    '#dc143c7a'
                ];
                const colorIndex = Math.min(Math.floor(lessonCount / 100), colors.length - 1);
            
                return colors[colorIndex];
            }
            
            const backgroundColor = getColor(data.lessonCount);
            document.getElementById('colour-pad').style.backgroundColor = backgroundColor;
        }

        // Show and configure logout button
        const logoutButton = document.getElementById('logout-button');
        logoutButton.style.display = 'inline-block'; // Show the button

        logoutButton.addEventListener('click', function() {
            window.location.href = '/tutor/logout';
        });
    })
    .catch(error => {
        window.location.href = `/tutor/login.html?message=Please log in.&type=error`;
    });
});



fetch('/tutor/countMessage')
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
    messageElement.textContent = 'Failed to load message count.';
    messageElement.classList.add('error');
    window.location.href = '/tutor/login.html?message=Please log in.&type=error';
});
