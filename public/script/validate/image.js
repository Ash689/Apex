function validateImage() {
    let imageButton = document.getElementById('imageSubmitBtn');

    document.getElementById('profile-photo').addEventListener('change', function (event) {
        messageElement.textContent = "SDKFLj";
        imageButton.disabled = false;
        imageButton.classList.remove('secondary-button');
    });
}