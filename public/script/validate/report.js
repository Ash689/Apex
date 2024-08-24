const submitBtn = document.getElementById('submitBtn');
let messageU = false;
let topicsU = false;

const topicsTitle = document.getElementById('topicsTitle');
const topicsField = document.getElementById('topics');

topicsField.addEventListener('input', function(event) {
    const topics = topicsField.value.trim();
    
    if (topics.length === 0) {
        topicsTitle.innerHTML = "Topic must not be empty";
        topicsU = false;
    } else {
        topicsTitle.innerHTML = '';
        topicsU = true;
    }
    validSubmit();
});

const messageTitle = document.getElementById('messageTitle');
const messageField = document.getElementById('message-input');

messageField.addEventListener('input', function(event) {
    const message = messageField.value.trim();
    
    if (message.length === 0) {
        messageTitle.innerHTML = "Reason must not be empty";
        messageU = false;
    } else {
        messageTitle.innerHTML = '';
        messageU = true;
    }
    validSubmit();
});


function validSubmit() {
    if (topicsU && messageU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
}

