const submitBtn = document.getElementById('submitBtn');
let subjectU = false;
let priceU = true;
let durationU = true;
let dateU = false;

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

dateField.addEventListener('change', function(event) {
    const date = new Date(dateField.value);
    const today = new Date();
    messageElement.textContent = ` ${(date.getFullYear() >= today.getFullYear())} &&  ${(date.getMonth() >= today.getMonth())} && ${(date.getDate() >= today.getDate())}`;

    if ((date.getFullYear() >= today.getFullYear()) &&  (date.getMonth() >= today.getMonth()) && (date.getDate() >= today.getDate())) {
        dateTitle.innerHTML = "";
        dateU = true;
    } else {
        dateTitle.innerHTML = "Booking must not be in the past.";
        dateU = false;
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
    messageElement.textContent = `${subjectU} && ${durationU} && ${priceU} && ${dateU}`;
    if (subjectU && durationU && priceU && dateU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
}
