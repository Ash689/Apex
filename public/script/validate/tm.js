function validateTM() {
    const tuitionField = document.getElementById('tuitionType');
    const tuitionButton = document.getElementById('tm-submitBtn');

    tuitionField.addEventListener('input', function(event) {
        tuitionButton.classList.remove('secondary-button');
        const tuitionText = tuitionField.value.trim();
        
        if (tuitionText > 10 && tuitionText < 100) {
            tuitionButton.classList.remove('disabled-button');
            tuitionButton.disabled = false;
        } else {
            tuitionButton.classList.add('disabled-button');
            tuitionButton.disabled = true;
        }
    });
}