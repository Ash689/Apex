const submitBtn = document.getElementById('submitBtn');
let subjectU = false;
let qualificationU = false;
let examBoardU = false;
let expectedGradeU = false;
let desiredGradeU = false;
let approachU = false;

const subjectTitle = document.getElementById('subjectTitle');
const subjectField = document.getElementById('subject');

subjectField.addEventListener('input', function(event) {
    const subject = subjectField.value.trim();
    if (subject.length === 0) {
        subjectTitle.innerHTML = "Subject must not be empty";
        subjectU = false;
    } else {
        subjectTitle.innerHTML = '';
        subjectU = true;
    }
    validSubmit();
});

const qualificationTitle = document.getElementById('qualificationTitle');
const qualificationField = document.getElementById('qualification');

qualificationField.addEventListener('input', function(event) {
    const qualification = qualificationField.value.trim();
    if (qualification.length === 0) {
        qualificationTitle.innerHTML = "Qualification must not be empty";
        qualificationU = false;
    } else {
        qualificationTitle.innerHTML = '';
        qualificationU = true;
    }
    validSubmit();
});


const examBoardTitle = document.getElementById('examBoardTitle');
const examBoardField = document.getElementById('studyExamBoard');

examBoardField.addEventListener('input', function(event) {
    const examBoard = examBoardField.value.trim();
    if (examBoard.length === 0) {
        examBoardTitle.innerHTML = "Exam board must not be empty";
        examBoardU = false;
    } else {
        examBoardTitle.innerHTML = '';
        examBoardU = true;
    }
    validSubmit();
});

const expectedGradeTitle = document.getElementById('expectedGradeTitle');
const expectedGradeField = document.getElementById('expectedGrade');

expectedGradeField.addEventListener('input', function(event) {
    const expectedGrade = expectedGradeField.value.trim();
    if (expectedGrade.length === 0) {
        expectedGradeTitle.innerHTML = "Expected Grade must not be empty";
        expectedGradeU = false;
    } else {
        expectedGradeTitle.innerHTML = '';
        expectedGradeU = true;
    }
    validSubmit();
});

const desiredGradeTitle = document.getElementById('desiredGradeTitle');
const desiredGradeField = document.getElementById('desiredGrade');

desiredGradeField.addEventListener('input', function(event) {
    const desiredGrade = desiredGradeField.value.trim();
    if (desiredGrade.length === 0) {
        desiredGradeTitle.innerHTML = "Expected Grade must not be empty";
        desiredGradeU = false;
    } else {
        desiredGradeTitle.innerHTML = '';
        desiredGradeU = true;
    }
    validSubmit();
});

const approachTitle = document.getElementById('approachTitle');
const approachField = document.getElementById('approach');

approachField.addEventListener('input', function(event) {
    const approach = approachField.value.trim();
    if (approach.length === 0) {
        approachTitle.innerHTML = "Approach must not be empty";
        approachU = false;
    } else if (approach.length < 5) {
        approachTitle.innerHTML = "Approach is too short";
        approachU = false;
    } else {
        approachTitle.innerHTML = '';
        approachU = true;
    }
    validSubmit();
});


function validSubmit() {
    if (subjectU && qualificationU && examBoardU && expectedGradeU && desiredGradeU && approachU){
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
}
