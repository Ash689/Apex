const emailField = document.getElementById('txtEmail');
const passwordField = document.getElementById('txtPassword');
const rePasswordField = document.getElementById('txtPassword2');
const submitBtn = document.getElementById('submitBtn');
const messageDiv = document.getElementById('message');

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    const errors = [];
    const minLength = 8;
    if (password.length < minLength) {
        errors.push(`- Minimum length: ${minLength}`);
    }
    if (!/[0-9]/.test(password)) {
        errors.push('- Includes a number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('- Includes a special character');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('- Includes a capital letter');
    }
    return errors;
}

function checkFormValidity() {
    const email = emailField.value;
    const password = passwordField.value;
    const repassword = rePasswordField.value;
    const errors = [];

    if (!validateEmail(email)) {
        errors.push("Invalid Email");
    }
    
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
        errors.push("Password needs to meet the following conditions:<br>" + passwordErrors.join('<br>'));
    }
    
    if (password !== repassword) {
        errors.push("Passwords don't match");
    }

    if (errors.length === 0) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
        messageDiv.innerHTML = '';
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
        messageDiv.innerHTML = errors.join("<br>");
        messageDiv.classList.add('error');
    }
}

emailField.addEventListener('input', checkFormValidity);
passwordField.addEventListener('input', checkFormValidity);
rePasswordField.addEventListener('input', checkFormValidity);