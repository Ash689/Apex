setupAutocomplete('desiredGrade', grades, 'desiredSuggestions');
setupAutocomplete('expectedGrade', grades, 'expectedSuggestions');

fetch('/student/userName')
.then(response => response.json())
.then(data => {
    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const profile3Element = document.getElementById('subjectTab');
        if (data.subjects && data.subjects.length > 0) {
            profile3Element.innerHTML = `
                <div class="subject-count">
                    <h3>Subjects:</h3>
                </div>
                <div class="subject-list">
                    <div class="subject-list-inner">
                        <!-- Subjects will be added dynamically here -->
                    </div>
                </div>
            `;
            const subjectListInner = profile3Element.querySelector('.subject-list-inner');
            data.subjects.forEach(subject => {
                const subjectElement = document.createElement('div');
                subjectElement.classList.add('subject');
                subjectElement.innerHTML = `
                    <p>${subject.examBoard} ${subject.qualification} ${subject.subject}</p>
                    <p>Expected: ${subject.expectedGrade} Desired: ${subject.desiredGrade}</p>
                    <p><i>${subject.learningApproach}</i></p>

                    <form action="/student/cancelSubject" method="POST">
                        <input type="hidden" name="subject" value="${subject.subject}">
                        <button type="submit">Redo</button>
                    </form>
                `;
                subjectListInner.appendChild(subjectElement); // Append subjectElement, not reviewElement
            });
        } else {
            profile3Element.innerHTML = `
                <div class="review-count">
                    <h3>There needs to be at least one subject</h3>
                </div>
            `;
        }
    }
})
.catch(error => {
    messageElement.textContent = 'Failed to load subjects.';
    messageElement.classList.add('error');
});

document.getElementById('info-button').title = "Give more information on how you want to learn" + "\n" + "E.g. Past papers, start from scratch";