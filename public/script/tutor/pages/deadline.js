fetch('/tutor/viewIndividualHomework')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const homework = data.homework;
        const dateElement = document.getElementById('deadline');
        if (homework) {
            const bookingDate = new Date(homework.deadline);
            const formattedDate = bookingDate.toISOString().split('T')[0];
            dateElement.value = formattedDate;

        } else {
            messageElement.textContent = 'Homework not found.';
            messageElement.classList.add('error');
        }
    }
})
.catch(error => {
    console.error(error);
    messageElement.textContent = 'Failed to show homework';
    messageElement.classList.add('error');
});