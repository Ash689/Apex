fetch('/student/viewMessenger')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const messengers = data.recipients;
        const profileElement = document.getElementById('profile');
        if (messengers.length === 0) {
            profileElement.innerHTML = '<p>No messages found.</p>';
        } else {
            messengers.forEach(messenger => {
                const messengerElement = document.createElement('div');
                messengerElement.classList.add('message-item');
                if (messenger.mostRecentMessage.includes("Lesson Report") &&
                    messenger.mostRecentMessage.includes("Success Topics") &&
                    messenger.mostRecentMessage.includes("Weak Topics")) {
                    messengerElement.innerHTML = `
                        <img id="P1" style = "width: 200px" alt="${messenger.originalname}" src="/uploads/profileFiles/tutor/profilePicture/${messenger.filename}" alt="Profile Image">
                        
                        <h3>Name: ${messenger.fullName}</h3>
                        
                        <p><em>Lesson Report Sent</em></p>
                    `;
                } else {
                
                    let truncatedMessage = messenger.mostRecentMessage.length > 20 
                    ? messenger.mostRecentMessage.substring(0, 20) + '...' 
                    : messenger.mostRecentMessage;

                    messengerElement.innerHTML = `
                        <img id="P1" style="width: 200px" alt="${messenger.originalname}" src="/uploads/profileFiles/tutor/profilePicture/${messenger.filename}" alt="Profile Image">
                        <h3>${messenger.fullName}</h3>
                        <p>'${truncatedMessage}'</p>
                    `;
                }   
                messengerElement.addEventListener('click', function() {
                    const form = document.createElement('form');
                    form.action = '/student/getID';
                    form.method = 'POST';
                    form.innerHTML = `
                        <input type="hidden" name="recipientEmail" value="${messenger._id}">
                    `;
                    document.body.appendChild(form);
                    form.submit();
                });
                profileElement.appendChild(messengerElement);
            });
        }
    }
})
.catch(error => {
    messageElement.textContent = 'Failed to load messages.';
    messageElement.classList.add('error');
});