fetch('/tutor/userName')
.then(response => response.json())
.then(data => {
    const messageElement = document.getElementById('message');

    if (data.error) {
        messageElement.textContent = data.error;
        messageElement.classList.add('error');
    } else {
        const profile3Element = document.getElementById('subjectTab');
        if (data.subjects && data.subjects.length > 0) {
            profile3Element.innerHTML = `
                
                <h3>Subjects: </h3>
                <div class="subject-list">
                    <table id = "subjectform2">
                        <tbody>
                            <div class="subject-list-inner">
                                <!-- Subjects will be added dynamically here -->
                            </div>
                        </tbody>
                    </table>
                </div>
            `;
            const subjectListInner = profile3Element.querySelector('.subject-list-inner');
            data.subjects.forEach(subject => {
                const subjectElement = document.createElement('div');
                subjectElement.classList.add('subject');
                subjectElement.innerHTML = `
                    <tr>
                        <td>Subject: ${subject.examBoard} ${subject.qualification} ${subject.subject}</td>
                        <br>
                    </tr>
                    <tr>
                        <td>Grade: ${subject.grade}</td>
                        <br>
                    </tr>
                    <tr>
                        <td><i>${subject.learningApproach}</i></td>
                    </tr>
                    <tr>
                        <form action="/tutor/cancelSubject" method="POST">
                            <input type="hidden" name="subject" value="${subject.subject}">
                            <button type="submit">Redo</button>
                        </form>
                    </tr>
                `;
                subjectListInner.appendChild(subjectElement); // Corrected variable name from reviewElement to subjectElement
            });
        } else {
            profile3Element.innerHTML = `
                <h3>There needs to be at least one subject</h3>
            `;
        }
    }
})
.catch(error => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Failed to load subjects.';
    messageElement.classList.add('error');
    console.error('Error fetching subjects:', error);
});


document.getElementById('info-button').title = "Give more information on how you want to teach" + "\n" + "E.g. Past papers, start from scratch";