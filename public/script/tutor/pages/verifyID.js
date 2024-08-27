fetch('/tutor/getVerifyID')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        if (data.isIDVerified && data.isDBSVerified){
            let form_container = document.getElementById('parent-form-container');
            form_container.innerHTML = `
                <h2>Upload Documents</h2>
                <h3>ID and DBS Verified</h3>
                <button id="id-button" class = "secondary-button">Re-Upload Images</button>
                <form id="subjectForm" action="/tutor/configBanking.html" method="GET">
                    <button type="submit">Continue</button>
                </form>
            
            `;
        } else if (data.id_file || data.dbs_file){
            let upload_sign = document.getElementById('upload-notice');
            upload_sign.textContent = "Thank you for your documents. Awaiting verification."
            let id_button = document.getElementById('id-button');
            id_button.textContent = "Upload Files Again";
        }
        document.getElementById('id-button').addEventListener('click', function() {
            let form_container = document.getElementById('parent-form-container');
            form_container.innerHTML = `
                <form id="subjectForm" action="/tutor/sendID" method="POST" enctype="multipart/form-data">
                    <h3 id = "id_header">Please upload ID: </h3>
                    <span id = "info-button" class="info-button">ℹ️</span>
                    ${data.id_file ? 
                        `<a href = /uploads/profileFiles/tutor/id/${data.id_file}>Download Sent ID</a>`
                    : ''}
                    <input id = "id-upload" type="file" name="document">
                    <p>Describe file:</p>
                    <div class="autocomplete-container">
                        <input name="description" id="description" class="notesContainerInput" autocomplete="off" required>
                        <div class="autocomplete-suggestions" id="descriptionSuggestions"></div>
                    </div>

                    <div class="submit-button-container">
                        <button type="submit" id = "submit" class = "disabled-button" disabled>Enter</button>
                    </div>
                </form>

                <form id="subjectForm" action="/tutor/sendDBS" method="POST" enctype="multipart/form-data">
                    <h3 id = "dbs_header">Please upload DBS: </h3>
                    <span id = "info-button2" class="info-button">ℹ️</span>
                    ${data.dbs_file ? 
                        `<a href = /uploads/profileFiles/tutor/dbs/${data.dbs_file}>Download Sent DBS</a>`
                    : ''}
                    <input id = "dbs-upload" type="file" name="document">
                    <div class="submit-button-container">
                        <button type="submit" id = "submitDBS" class = "disabled-button" disabled>Enter</button>
                    </div>
                </form>
            `;
            
            autoCompleteDescription();

            validateID();
            validateDBS();
                    
            document.getElementById('info-button').title = "Valid documents include driving license, passport, NINO letter";
            document.getElementById('info-button2').title = "Please show DBS letter";
            
            let dbs_header = document.getElementById('dbs_header');
            dbs_header.textContent +=  `${data.email}`;

            let id_header = document.getElementById('id_header');
            id_header.textContent += `${data.email}`;

            const idTypes = [
                "Passport", 
                "Driving Licence", 
                "Biometric Residence Card", 
                "National Identity Card", 
                "Travel Document", 
                "Birth/Adoption certificate", 
            ];

            $(function() {

                $("#description").autocomplete({
                    source: idTypes,
                    minLength: 0,
                    select: function(event, ui) {
                        $("#description").val(ui.item.value);
                        return false;
                    }
                }).focus(function() {
                    $(this).autocomplete("search", "");
                });

            });
            
        });
    }
})
.catch(error => {
    console.error('Error:', error);
    window.location.href = `/tutor/login.html?message=Please log in.&type=error`;
});


const logoutButton = document.getElementById('logout-button');
logoutButton.style.display = 'inline-block'; // Show the button

logoutButton.addEventListener('click', function() {
    window.location.href = '/tutor/logout';
});