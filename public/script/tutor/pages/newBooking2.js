const timeSelect = document.getElementById('bookingTime');

// Clear existing options except the first one
while (timeSelect.options.length > 1) {
    timeSelect.remove(1);
}

// Populate with new options
for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
        let time = ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2);
        let option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    }
}

document.getElementById('info-button').title = "Tutoring Lesson: Prices range from £10 to £40" + "\n" + "Revision Session: Prices range from £5 to £12" + "\n" + "Introduction Session: Free";