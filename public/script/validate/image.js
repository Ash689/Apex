document.addEventListener("DOMContentLoaded", function() {
    // Poll for the presence of the dynamically loaded form
    function waitForForm() {
        let imageInput = document.getElementById('profile-image');
        let imageButton = document.getElementById('imageSubmitBtn');

        // Check if the elements are available yet
        if (imageInput && imageButton) {
            // Now attach event listeners
            imageInput.addEventListener('change', function(event) {
                if (imageInput.files.length > 0) {
                    // Assuming messageElement is already declared somewhere in the global scope
                    messageElement.textContent = "Image selected.";
                    imageButton.disabled = false;
                    imageButton.classList.remove('secondary-button');
                } else {
                    messageElement.textContent = "No image selected.";
                    imageButton.disabled = true;
                    imageButton.classList.add('secondary-button');
                }
            });
        } else {
            // If form elements are not present yet, retry after a short delay
            setTimeout(waitForForm, 100); // Retry after 100ms
        }
    }

    // Start polling for the form
    waitForForm();
});
