fetch('/student/apiprofile')
.then(response => response.json())
.then(data => {
    const messageElement = document.getElementById('message');
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        if (data.fullName){
            document.getElementById('fullName').value= data.fullName;
            document.getElementById('fullName').readOnly = true;
            document.getElementById('fullName').required = false;
            document.getElementById('nameRow').classList.add('miss');
            
            document.getElementById('dateOfBirth').readOnly = true;
            document.getElementById('dateOfBirth').required = false;
            document.getElementById('birthRow').classList.add('miss');

            document.getElementById('number').required = false;
            document.getElementById('tuitionType').required = false;
            document.getElementById('formatted_address_0').required = false;
            document.getElementById('postcode').required = false;

            nameU = true;
            dobU = true;
            fileU = true;
            addressU = true;
            numberU = true;
        }
    }
})
.catch(error => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Failed to load profile.';
    messageElement.classList.add('error');
    console.error('Error fetching profile:', error);
});