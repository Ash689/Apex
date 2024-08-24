

let submitBtn = document.getElementById('submit');
let nameU = false;
let fileU = false;
let descU = false;


let name = document.getElementById('topicNameInput');

name.addEventListener('input', function() {
    if (name.value.length > 0){
        nameU = true;
    } else {
        nameU = false;
    }
    validSubmit();
});

document.getElementById('id-upload').addEventListener('change', function(event) {
    
    fileU = true;
    if (fileU && descU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
});




function validSubmit(){
    
    if (nameU && fileU && descU){
        submitBtn.classList.remove('disabled-button');
        submitBtn.disabled = false;
    } else {
        
        submitBtn.classList.add('disabled-button');
        submitBtn.disabled = true;
    }
}