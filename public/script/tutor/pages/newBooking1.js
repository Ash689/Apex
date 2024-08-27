document.getElementById('duration').value = 40;
document.getElementById('recurringToggle').addEventListener('click', function() {
    var recurringValue = document.getElementById('recurring');
    var recurringButton = document.getElementById('recurringToggle');
    // Check if the register button text is "Get Started"
    if (recurringValue.value === 'No') {
        recurringValue.value = 'Yes';
        recurringButton.textContent = "Yes";
        recurringButton.style = "background-color: #9d1a34; color: #efefef";
    } else {
        recurringButton.style = "";
        recurringValue.value = 'No';
        recurringButton.textContent = "No";
    }
});


document.getElementById('revisionToggle').addEventListener('click', function() {
    var revisionValue = document.getElementById('revision');
    var revisionButton = document.getElementById('revisionToggle');
    // Check if the register button text is "Get Started"
    if (revisionValue.value === 'no') {
        revisionValue.value = 'yes';
        revisionButton.className = "tertiary-button";
        revisionButton.textContent = "Recurring Session";
    } else {
        revisionButton.className = "";
        revisionValue.value = 'no';
        revisionButton.textContent = "Tutoring Lesson";
    }
});