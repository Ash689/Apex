const submitBtn = document.getElementById('submitBtn');
let subjectU = false;
let dateU = false;
let durationU = false;

const subjectTitle = document.getElementById('subjectTitle');
const subjectField = document.getElementById('subject');

subjectField.addEventListener('input', function(event) {
    const subject = subjectField.value.trim();

    const subjectRegex = /^[A-Za-z]+(?:\s[A-Za-z-]+)+$/;
    
    if (!subjectRegex.test(subject)) {
        subjectTitle.innerHTML = "Subject must contain only letters, hyphens, and at least one space.";
        subjectU = false;
        validSubmit()
    } else {
        subjectTitle.innerHTML = '';
        subjectU = true;
        validSubmit()
    }
});



const durationTitle = document.getElementById('durationTitle');
const durationField = document.getElementById('duration');

durationField.addEventListener('input', function(event) {
    const duration = durationField.value;
    if (duration > 180 || duration < 40){
        durationTitle.innerHTML = "Please enter duration between 40 and 180 minutes.";
        durationU = false;
        validSubmit()

    } else {
        durationTitle.innerHTML = '';
        durationU = true;
        validSubmit()
    }
});


const dateTitle = document.getElementById('dateTitle');
const dateField = document.getElementById('bookingDate');

dateField.addEventListener('input', function(event) {
    const selectedDateTime = new Date(dateField.value);
    const now = new Date();

    // Adjust `now` to the current date and time
    now.setMilliseconds(0);
    now.setSeconds(0);
    now.setMinutes(0);
    now.setHours(now.getHours());

    // Check if the selected date and time is in the past
    if (selectedDateTime < now) {
        dateTitle.innerHTML = "The date and time cannot be in the past.";
        dateU = false;
        validSubmit();
    } else {
        dateTitle.innerHTML = "";
        dateU = true;
        validSubmit();   // Pass `true` if valid
    }
});

function validSubmit() {
    if (subjectU && durationU && dateU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
}
