document.addEventListener("DOMContentLoaded", function() {
    // Poll for the presence of the dynamically loaded form
    function validateTM() {
        const tuitionField = document.getElementById('tuitionType');
        const tuitionButton = document.getElementById('tm-submitBtn');

        if (tuitionField && tuitionButton){
    
            tuitionField.addEventListener('input', function(event) {
                tuitionButton.classList.remove('secondary-button');
                const tuitionText = tuitionField.value.trim();
                
                if (tuitionText.length > 10 && tuitionText.length < 100) {
                    tuitionButton.classList.remove('disabled-button');
                    tuitionButton.disabled = false;
                } else {
                    tuitionButton.classList.add('disabled-button');
                    tuitionButton.disabled = true;
                }
            });
        } else {
            setTimeout(validateTM, 100);
        }
    }

    // Start polling for the form
    validateTM();
});
