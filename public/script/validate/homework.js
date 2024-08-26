

let submitBtn = document.getElementById('submit');
let nameU = false;
let deadlineU = false;


let topicName = document.getElementById('topicNameInput');

topicName.addEventListener('input', function() {
    if (topicName.value.length > 0){
        nameU = true;
    } else {
        nameU = false;
    }
    validSubmit();
});


let deadline = document.getElementById('deadline');
deadline.addEventListener('input', function(event) {
    deadlineU = true;
    validSubmit();
});




function validSubmit(){
    if (nameU && deadlineU){
        submitBtn.classList.remove('disabled-button');
        submitBtn.disabled = false;
    } else {
        
        submitBtn.classList.add('disabled-button');
        submitBtn.disabled = true;
    }
}