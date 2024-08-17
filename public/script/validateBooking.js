const submitBtn = document.getElementById('submitBtn');
let dateU = false;


const dateTitle = document.getElementById('dateTitle');
const dateField = document.getElementById('bookingDate');

dateField.addEventListener('input', function(event) {
    const selectedDate = new Date(dateField.value);
    const today = new Date();

    document.getElementById('message').textContent = `Selected: ${dateField.value}, Today: ${today}`;

    if (selectedDate >= today) {
        dateTitle.innerHTML = "The date cannot be in the past.";
        dateU = false;
    } else {
        dateTitle.innerHTML = "";
        dateU = true;
    }

    validSubmit();
});

function validSubmit() {
    if (dateU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
}
