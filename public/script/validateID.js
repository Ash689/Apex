function validateID(){
    
    let submitBtn = document.getElementById('submit');
    let desc = document.getElementById('description');
    let fileU = false;
    let descU = false;

    desc.addEventListener('input', function() {
        if (desc.value.length > 0){
            descU = true;
        } else {
            descU = false;
        }

        if (fileU && descU){
            submitBtn.disabled = false;
            submitBtn.classList.remove('disabled-button');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('disabled-button');
        }

    });

    document.getElementById('id-upload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            fileU = true;
        }
        if (fileU && descU){
            submitBtn.disabled = false;
            submitBtn.classList.remove('disabled-button');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.add('disabled-button');
        }
    });
}



function validateDBS(){
    
    let submitBtn = document.getElementById('submitDBS');
    document.getElementById('dbs-upload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('disabled-button');
        }
    });
}