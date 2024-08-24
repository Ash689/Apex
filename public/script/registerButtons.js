function registerButtons(){
    document.getElementById('parent-btn-register').addEventListener('click', function() {
        window.location.href = './student/register.html';
    });

    document.getElementById('tutor-btn-register').addEventListener('click', function() {
        window.location.href = './tutor/register.html';
    });
}