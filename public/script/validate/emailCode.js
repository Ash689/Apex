let code = document.getElementById('code');
let submitBtn = document.getElementById('codeSubmit');

code.addEventListener('input', function() {
    const codeValue = code.value;

    if (codeValue.length > 8 || codeValue.length < 8) {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
        messageDiv.textContent = 'Characters cannot exceed more than 8';
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
        messageDiv.textContent = '';
    }
});