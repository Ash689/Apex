

let submitBtn = document.getElementById('submitBtn');


let score = document.getElementById('score');

score.addEventListener('input', function() {
    if (score.value >= 0 && score.value <= 100){
        submitBtn.classList.remove('disabled-button');
        submitBtn.disabled = false;
    } else {
        submitBtn.classList.add('disabled-button');
        submitBtn.disabled = true;
    }
});