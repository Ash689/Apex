const submitBtn = document.getElementById('submitBtn');
let subjectU = true;
let priceU = true;
let durationU = true;
let dateU = true;
let timeU = true;

const subjectTitle = document.getElementById('subjectTitle');
const subjectField = document.getElementById('subject');

subjectField.addEventListener('input', function(event) {
    const subject = subjectField.value.trim();
    if (subject.length === 0) {
        subjectTitle.innerHTML = "Subject must not be empty";
        subjectU = false;
    } else {
        subjectTitle.innerHTML = '';
        subjectU = true;
    }
    validSubmit();
});



const durationTitle = document.getElementById('durationTitle');
const durationField = document.getElementById('duration');

durationField.addEventListener('input', function(event) {
    const duration = durationField.value.trim();

    if (duration > 0) {
        durationTitle.innerHTML = '';
        durationU = true;
    } else {
        durationTitle.innerHTML = "Please enter a valid duration.";
        durationU = false;
    }
    validSubmit();
});


const dateTitle = document.getElementById('dateTitle');
const dateField = document.getElementById('bookingDate');
const timeField = document.getElementById('bookingTime');

dateField.addEventListener('change', function(event) {
    const date = new Date(dateField.value); // Date selected by the user
    
    const today = new Date();
    timeField.value = "";  
    
    // timeU = false;

    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    

    if (date >= today) {
        dateTitle.innerHTML = "";
        dateU = true;
    } else {
        dateTitle.innerHTML = "Booking must not be in the past.";
        dateU = false;
    }
    validSubmit();
});


const timeTitle = document.getElementById('timeTitle');

timeField.addEventListener('change', function() {
    const date = new Date(dateField.value);
    const today = new Date();
    let currentHour = today.getHours();
    let currentMinute = today.getMinutes();

    // If the date is today, validate the selected time
    if (dateField.value && date.toDateString() === today.toDateString()) {
        let [selectedHour, selectedMinute] = timeField.value.split(':').map(Number);

        // Check if selected time is earlier than the current time
        if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
            timeTitle.innerHTML = 'Selected time cannot be in the past for today.';
            timeU = false;
        } else {
            timeTitle.innerHTML = '';
            timeU = true;
        }
    } else {
        // Any time is valid if the selected date is not today
        timeTitle.innerHTML = '';
        timeU = true;
    }

    validSubmit();
});

const priceTitle = document.getElementById('priceTitle');
const priceField = document.getElementById('newPrice');

priceField.addEventListener('input', function(event) {
    const price = priceField.value.trim();

    if (price > 0) {
        priceTitle.innerHTML = '';
        priceU = true;
    } else {
        priceTitle.innerHTML = "Please enter a valid price.";
        priceU = false;
    }
    validSubmit();
});


function validSubmit() {
    if (subjectU && durationU && priceU && dateU && timeU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
}
