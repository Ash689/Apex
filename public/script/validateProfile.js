const submitBtn = document.getElementById('submitBtn');
let fileU = false;
let nameU = false;
let addressU = false;
let numberU = false;
let dobU = false;

const fullNameTitle = document.getElementById('fullNameTitle');
const fullNameField = document.getElementById('fullName');

fullNameField.addEventListener('input', function(event) {
    const fullName = fullNameField.value.trim();

    const fullNameRegex = /^[A-Za-z]+(?:\s[A-Za-z-]+)+$/;
    
    if (!fullNameRegex.test(fullName)) {
        fullNameTitle.innerHTML = "Full name must contain only letters, hyphens, and at least one space.";
        nameU = false;
    } else {
        fullNameTitle.innerHTML = '';
        nameU = true;
    }
    validSubmit();
});



const numberTitle = document.getElementById('numberTitle');
const numberField = document.getElementById('number');

numberField.addEventListener('input', function(event) {
    const number = numberField.value.trim();
    const ukPhoneRegex = /^(?:\+44|0)\d{10}$/;

    // Check if the number matches the UK phone number format
    if (!ukPhoneRegex.test(number)) {
        numberTitle.innerHTML = "Please enter a valid UK phone number.";
        numberU = false;
    } else {
        numberTitle.innerHTML = '';
        numberU = true;
    }
    validSubmit();
});


const addressTitle = document.getElementById('addressTitle');
const addressField = document.getElementById('formatted_address_0');

addressField.addEventListener('input', function(event) {

    if (addressField.value) {
        addressTitle.innerHTML = '';
        addressU = true;
    } else {
        addressTitle.innerHTML = "Please enter a valid address.";
        addressU = false;
    }
    validSubmit();
});


const dobTitle = document.getElementById('dobTitle');
const dobField = document.getElementById('dateOfBirth');

dobField.addEventListener('input', function(event) {
    const dateOfBirth = new Date(dobField.value);
    const today = new Date();

    // Calculate the age
    let age = today.getFullYear() - dateOfBirth.getFullYear();

    // Validate age is between 18 and 80 years
    if (age < 18 || age > 80) {
        dobTitle.innerHTML = "You must be between 18 and 80 years old.";
        dobU = false;
        validSubmit();
    } else {
        dobTitle.innerHTML = "";
        dobU = true;
        validSubmit();
    }
});


document.getElementById('profile-photo').addEventListener('change', function(event) {
    const file = event.target.files[0];
    fileU = true;
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-image').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

function previewFile() {
    var preview = document.querySelector('img#profile-image');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();

    reader.addEventListener("load", function() {
        preview.src = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }
}


document.getElementById('info-button').title = "Include a picture! This will be reviewed and moderated before submission.";

