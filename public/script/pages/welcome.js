window.onload = function() {
    setTimeout(function() {
        window.scrollTo(-100, -100); // Scroll to the top of the page
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
            header.style.top = '5%'; // Move the header upwards
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
        document.getElementById('container').style.height = '900px';
    } else {
        studentCred.innerHTML = `
            <button id="parent-btn-register">Get Started</button>
        `;
        document.getElementById('parent-form-container').style.maxHeight =  '200px';
        document.getElementById('container').style.height = '650px';
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
        document.getElementById('container').style.height = '900px';
    } else {
        tutorCred.innerHTML = `
            <button id = "tutor-btn-register">Get Started</button>
        `;
        document.getElementById('tutor-form-container').style.maxHeight =  '200px';
        document.getElementById('container').style.height = '650px';
        loginButton.textContent = 'Login';
        
        registerButtons();
    }
});

registerButtons();

fetch('/footer.html')
.then(response => response.text())
.then(data => {
    document.getElementById('footer').innerHTML = data;
}).catch(error => console.error('Error loading the footer:', error));


document.getElementById('aboutus-student-button').addEventListener('click', function() {
    changeColour("aboutus-student-button");
    
    document.getElementById('aboutus-tutor-button').disabled = false;
    document.getElementById('aboutus-tutor-button').style = "width: auto;";
    document.getElementById("aboutus-text").innerHTML = `
    <p>
        My name is Umar, I'm currently a student, studying computer science.<br>
        I have been a tutor for 4 years, before in person, and now online. <br>
        I created this website as a hobby: I thought about what I, as a tutor, would want the students to have more of. <br>
        Tutors are not teachers, we are a friend. We are a support system that has got student's back, gives them someone they can talk to about their education and help them with their progression, generally.<br> 
        We are on their level, we give them advice on academica, but also life, as we know the present circumstances that students are concerned with nowadays. <br>
        Attend our lessons and don't receive tuition anymore.
        Receive <span class = "emphasis" >Apex Tuition</span>.
    </p>
    `;
    
    document.getElementById('aboutus-student-button').disabled = true;

});

document.getElementById('aboutus-tutor-button').addEventListener('click', function() {
    changeColour("aboutus-tutor-button");
    document.getElementById('aboutus-student-button').disabled = false;
    document.getElementById('aboutus-student-button').style = "width: auto;";
    document.getElementById("aboutus-text").innerHTML = `
    <p>
        My name is Umar, I'm currently a student, studying computer science.<br>
        I have been a tutor for 4 years, before in person, and now online. <br>
        I created this website as a hobby: I thought about what I, as a tutor, would want more creative freedom over. <br>
        I thought about what tools I wanted to see, what features I wanted implemented, and how to make the students believe that they were the priority. <br>
        Tutors are not teachers, we are a friend. We are a support system that has got student's back, gives them someone they can talk to about their education and help them with their progression, generally.<br> 
        We are on their level, we give them advice on academica, but also life, as we know the present circumstances that students are concerned with nowadays. <br>
        Join us and make a difference. Don't be a tutor. <br>
        Be an <span class = "emphasis" >Apex Tutor</span>.
    </p>
    `;
    
    document.getElementById('aboutus-tutor-button').disabled = true;
});

function changeColour(button){
    document.getElementById(button).style = "background-color: #9d1a34; color: #efefef; width: auto;";
}

changeColour("aboutus-student-button");

document.getElementById("aboutus-text").innerHTML = `
    <p>
         My name is Umar, I'm currently a student, studying computer science.<br>
        I have been a tutor for 4 years, before in person, and now online. <br>
        I created this website as a hobby: I thought about what I, as a tutor, would want the students to have more of. <br>
        Tutors are not teachers, we are a friend. We are a support system that has got student's back, gives them someone they can talk to about their education and help them with their progression, generally.<br> 
        We are on their level, we give them advice on academica, but also life, as we know the present circumstances that students are concerned with nowadays. <br>
        Attend our lessons and don't receive tuition anymore.
        Receive <span class = "emphasis" >Apex Tuition</span>.
    </p>
`;


document.getElementById('aboutus-student-button').disabled = true;