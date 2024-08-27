document.addEventListener('DOMContentLoaded', () => {
    const days = document.querySelectorAll('#day');
    const daysAvailableInput = document.getElementById('daysAvailable');
    let selectedDays = [];

    days.forEach(day => {
        day.addEventListener('click', () => {
            const dayName = day.getAttribute('data-day');
            if (selectedDays.includes(dayName)) {
                selectedDays = selectedDays.filter(d => d !== dayName);
                day.classList.remove('selected');
                day.style = "";
            } else {
                selectedDays.push(dayName);
                day.classList.add('selected');
                day.style = "background-color: #9d1a34; color: white;"
            }
            daysAvailableInput.value = selectedDays.join(',');
        });
    });
});  