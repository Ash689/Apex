{/* <script src="/script/standardScript.js"></script> */}

const messageElement = document.getElementById('message');
const urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message');
const messageType = urlParams.get('type');

if (message) {
    messageElement.textContent = message;
    messageElement.classList.add(messageType);

    setTimeout(function() {
        messageElement.textContent = '';
        messageElement.classList.remove(messageType);
    }, 5000);
}

window.onload = function() {
    setTimeout(function() {
        window.scrollTo(0, 0); // Scroll to the top of the page
    }, 0); // This slight delay helps ensure it scrolls after the page has fully loaded
};

document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        var header = document.querySelector('.header');
        header.style.top = '-7%'; // Move the header upwards
    }, 0); // Wait for the transition to complete before hiding

    
});

$(function() {
    $("#bookingDate").datepicker({
        dateFormat: "yy-mm-dd",
        minDate: 0
    });

    const availableSubjects = [
        "Math",
        "Science",
        "English",
        "History",
        "Geography"
        // Add more subjects as needed
    ];

    $("#subject").autocomplete({
        source: availableSubjects,
        minLength: 0,
        select: function(event, ui) {
            $("#subject").val(ui.item.value);
            return false;
        }
    }).focus(function() {
        $(this).autocomplete("search", "");
    });
});



$('head').append('<link href="//fonts.googleapis.com/css?family=Open+Sans:300,400,600" rel="stylesheet" type="text/css">');

$('input').focus(function(event) {
    $(this).closest('.float-label-field').addClass('float').addClass('focus');
});

$('input').blur(function() {
    $(this).closest('.float-label-field').removeClass('focus');
    if (!$(this).val()) {
        $(this).closest('.float-label-field').removeClass('float');
    }
});

fetch('/footer')
.then(() => {
    const footerElement = document.getElementById('footer');
    footerElement.innerHTML = `
        <p>&copy; 2024 Tutoring. All rights reserved.</p>
    `;
})
.catch(error => {
    console.error('Error fetching footer:', error);
});



const timeSelect = document.getElementById('bookingTime');
for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
        let time = ('0' + hour).slice(-2) + ':' + ('0' + minute).slice(-2);
        let option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    }
}

function setMaxLengths() {
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.maxLength = "22";
    });

    const textAreainputs = document.querySelectorAll('textarea');
    textAreainputs.forEach(areaInput => {
        areaInput.maxLength = "100";
    });
}

// Set maximum lengths on page load
window.onload = setMaxLengths;
