document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('access');

    if (accountId != "denied") {

        try {
            const response = await fetch('/tutor/alreadyValidated', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ page: "configProfile" }),
            });

            const data = await response.json();
            if (data.pageAvailable){
                window.location.href = "/error.html?access=denied";
            }

        } catch (error) {
            console.log(error);
        }
    }
});



let teachU = false;

const teachTitle = document.getElementById('teachTitle');
const teachField = document.getElementById('tuitionType');

teachField.addEventListener('input', function(event) {
    const teach = teachField.value.trim();

    if (teach.length > 100) {
        teachTitle.innerHTML = "Please enter 100 characters or less.";
        teachU = false;
        validSubmit();
    } else {
        teachTitle.innerHTML = '';
        teachU = true;
        validSubmit();
    }
});

function validSubmit() {
    if (fileU && nameU && addressU && numberU && dobU && teachU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
}

document.getElementById('info-button2').title = "E.g. 4 years of teaching, ranging from starting from scratch up to exam prep.";