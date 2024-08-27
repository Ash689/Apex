window.onload = function() {
    setTimeout(function() {
        window.scrollTo(0, 0); // Scroll to the top of the page
    }, 0); // This slight delay helps ensure it scrolls after the page has fully loaded
};
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        var introSection = document.getElementById('intro-section');
        introSection.classList.add('hidden'); // Hide the intro section

        setTimeout(function() {
            introSection.style.display = 'none'; // Remove the intro section from display after transition

            var formContainer = document.getElementById('parent-form-container');
            formContainer.style.opacity = '1'; // Show the form container
            formContainer.style.transform = 'translateY(0)'; // Move it back to original position

            formContainer = document.getElementById('tutor-form-container');
            formContainer.style.opacity = '1'; // Show the form container
            formContainer.style.transform = 'translateY(0)'; // Move it back to original position

            var header = document.querySelector('.header');
            header.style.top = '10%'; // Move the header upwards
        }, 1000); // Wait for the transition to complete before hiding
    }, 3000);
});


var studentCred = document.getElementById('student-part');
var tutorCred = document.getElementById('tutor-part');


document.getElementById('parent-btn-login').addEventListener('click', function() {
    var loginButton = document.getElementById('parent-btn-login');

    // Check if the register button text is "Get Started"
    if (loginButton.textContent === 'Login') {
        studentCred.innerHTML = `
            <form id="parent-form" class="hidden" action = "/student/login" method = "POST">
                <fieldset class='float-label-field'>
                    <label for="txtEmail">Email</label>
                    <input type="email" name="email" required><br><br>
                </fieldset>
                <fieldset class='float-label-field'>
                    <label for="txtPassword">Password</label>
                    <input type="password" name="password" maxlength="15" required><br><br>
                </fieldset>
                <button type="submit">Enter</button>
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
        loginButton.textContent = "Back";
        document.getElementById('parent-form-container').style.maxHeight = '450px';
    } else {
        studentCred.innerHTML = `
            <button id="parent-btn-register">Get Started</button>
        `;
        document.getElementById('parent-form-container').style.maxHeight =  '200px';
        loginButton.textContent = "Login";
        
        registerButtons();
    }
});

document.getElementById('tutor-btn-login').addEventListener('click', function() {
    var loginButton = document.getElementById('tutor-btn-login');

    // Check if the register button text is "Get Started"
    if (loginButton.textContent === 'Login') {
        tutorCred.innerHTML = `
            <form id="tutor-form" class="hidden" action = "/tutor/login" method = "POST">
                <fieldset class='float-label-field'>
                    <label for="txtEmail">Email</label>
                    <input type="email" name="email" required><br><br>
                </fieldset>
                <fieldset class='float-label-field'>
                    <label for="txtPassword">Password</label>
                    <input type="password" name="password" maxlength="15" required><br><br>
                </fieldset>
                <button type="submit">Enter</button>
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
        loginButton.textContent = 'Back';
        document.getElementById('tutor-form-container').style.maxHeight = '450px';
    } else {
        tutorCred.innerHTML = `
            <button id = "tutor-btn-register">Get Started</button>
        `;
        document.getElementById('tutor-form-container').style.maxHeight =  '200px';
        loginButton.textContent = 'Login';
        
        registerButtons();
    }
});

registerButtons();