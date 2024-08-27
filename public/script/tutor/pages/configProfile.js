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