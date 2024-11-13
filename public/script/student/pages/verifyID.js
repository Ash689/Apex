fetch('/student/getVerifyID')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        if (data.isIDVerified){
            let form_container = document.getElementById('parent-form-container');
            form_container.innerHTML = `
                <h2>Upload Documents</h2>
                <h3>ID Verified</h3>
                <button id="id-button" class = "secondary-button">Re-Upload Images</button>
                <form id="subjectForm" action="/student/introduction.html" method="GET">
                    <button type="submit">Continue</button>
                </form>
            
            `;
        } else if (data.id_file){
            let upload_sign = document.getElementById('upload-notice');
            upload_sign.textContent = "Thank you for your documents. Awaiting verification."
            let id_button = document.getElementById('id-button');
            id_button.textContent = "Upload Files Again";
        }
        document.getElementById('id-button').addEventListener('click', function() {
            let form_container = document.getElementById('parent-form-container');
            form_container.innerHTML = `
            
                <form id="subjectForm" action="/student/sendID" method="post" enctype="multipart/form-data">
                    <h3 id = "id_header">Please upload ID: </h3>
                    <span id = "info-button" class="info-button">ℹ️</span>
                    ${data.id_file ? 
                        `<a href = /uploads/profileFiles/student/id/${data.id_file}>Download Sent ID</a>`
                    : ''}
                    <input type="file" id = "id-upload" name="document">
                    <p>Describe file:</p>

                    <div class="autocomplete-container">
                        <input name="description" id="description" class="notesContainerInput" autocomplete="off" required>
                        <div class="autocomplete-suggestions" id="descriptionSuggestions"></div>
                    </div>

                    <div class="submit-button-container">
                        <button type="submit" id = "submit" class = "disabled-button" disabled>Enter</button>
                    </div>
                </form>
            `;

            autoCompleteDescription();

            validateID();

                    
            document.getElementById('info-button').title = "Valid documents include driving license, passport, NINO letter";
            
        });
    }
})
.catch(error => {
    console.error('Error:', error);
    window.location.href = `/student/login.html?message=Please log in .&type=error`;
});