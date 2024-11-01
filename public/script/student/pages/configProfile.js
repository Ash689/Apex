document.addEventListener('DOMContentLoaded', async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('access');

    if (accountId != "denied") {

        try {
            const response = await fetch('/student/alreadyValidated', {
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



function validSubmit() {
    if (fileU && nameU && addressU && numberU && dobU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
}