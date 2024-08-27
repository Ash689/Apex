document.getElementById('parent-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    var email = document.getElementById('txtEmail').value;

    const messageElement = document.getElementById('message');

    messageElement.textContent = 'If account associated with email exists, an email has been sent to reset the password';
    messageElement.classList.add('success');

    setTimeout(function() {
        messageElement.textContent = '';
        messageElement.classList.remove('success');
    }, 5000);

    fetch('/student/forgotPassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('entry').innerHTML = `
                <form id="code-form" action="/student/codeEntry" method="POST">
                    <fieldset class='float-label-field'>
                        <label for="digit-input">Enter the 8-digit code</label>
                        <input id="digit-input" type="text" name="code" required><br><br>
                    </fieldset>
                    <button type="submit">Submit Code</button>
                </form>
            `;
            $('head').append('<link href="//fonts.googleapis.com/css?family=Open+Sans:300,400,600" rel="stylesheet" type="text/css">');

            $('input').focus(function(event) {
                $(this).closest('.float-label-field').addClass('float').addClass('focus');
            });

            $('input').blur(function() {
                $(this).closest('.float-label-field').removeClass('focus');
                if (!$(this).val()) {
                    $(this).closest('.float-label-field').removeClass('float');
                }
            });

            document.getElementById('code-form').addEventListener('submit', function(event) {
                const digitInput = document.getElementById('digit-input').value;
                const isCorrectDigits = /^\d{8}$/.test(digitInput);

                if (!isCorrectDigits) {
                    messageElement.textContent = 'Please enter exactly 8 digits';
                    messageElement.classList.remove('success');
                    messageElement.classList.add('error');
                    event.preventDefault();
                }
            });
        } else {
            messageElement.textContent = 'Error sending email. Please try again.';
            messageElement.classList.remove('success');
            messageElement.classList.add('error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
});