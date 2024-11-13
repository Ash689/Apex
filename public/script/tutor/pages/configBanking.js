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
                body: JSON.stringify({ page: "configBanking" }),
            });

            const data = await response.json();
            if (data.pageAvailable){
                window.location.href = "/tutor/home.html?access=denied";
            }

        } catch (error) {
            console.log(error);
        }
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    fetch('/tutor/bankStatus')
    .then(response => response.json())
    .then(data => {
        if (data.success){
            let notice = document.getElementById('upload-notice');
            notice.textContent = `Banking details added`;
            let idButton = document.getElementById('id-button');
            idButton.textContent = `Continue`;   
        }                  

    });

    document.getElementById('id-button').addEventListener('click', function() {

        fetch('/tutor/bankStatus')
        .then(response => response.json())
        .then(data => {
            if (data.success){
                let notice = document.getElementById('upload-notice');
                notice.textContent = `Banking details added`;
                let idButton = document.getElementById('id-button');
                idButton.textContent = `Continue`;
                window.location.href = '/tutor/introduction.html';  
            } else {
                fetch('/tutor/createStripeAccount')
                .then(response => response.json())
                .then(data => {
                    if (data.link){
                        window.location.href = `${data.link}`;
                    }
                })
                .catch(error => {
                    console.error('Error creating stripe account:', error);
                    messageElement.textContent = 'Failed to create stripe account';
                    messageElement.classList.add('error');
                });
            }                  

        });

        
    });

    const urlParams = new URLSearchParams(window.location.search);
    const accountId = urlParams.get('account');

    if (accountId) {
        try {
            const response = await fetch('/tutor/completeBankingSetup', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accountId }),
            });

            const result = await response.json();

            if (result.success) {
                messageElement.textContent = "Payment Details Saved. Please refresh the page";
            }
        } catch (error) {
            console.log(error);
        }
    }
});