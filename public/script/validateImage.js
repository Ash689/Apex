let imageButton = document.getElementById('imageSubmitBtn');

document.getElementById('profile-photo').addEventListener('change', function(event) {
    imageButton.disabled = false;
    imageButton.classList.remove('disabled-button');
});