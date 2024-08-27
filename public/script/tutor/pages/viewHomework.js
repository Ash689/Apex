document.addEventListener('DOMContentLoaded', () => {
    const homeworkBody = document.getElementById('homeworkBody');

    fetch('/tutor/getHomework')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                const errorMessage = document.createElement('p');
                errorMessage.textContent = data.error;
                errorMessage.classList.add('error');
                document.getElementById('message').appendChild(errorMessage);
            } else {
                const homework = data.homework;
                homework.forEach(note => {
                    // Create a new row for each homework entry
                    const row = document.createElement('tr');

                    // Date Posted
                    const dateCell = document.createElement('td');
                    const postedDate = new Date(note.posted);
                    const formattedDate = postedDate.toLocaleDateString('en-UK', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    });
                    dateCell.textContent = formattedDate;
                    row.appendChild(dateCell);

                    // Topic Name
                    const topicCell = document.createElement('td');
                    topicCell.textContent = note.topicName;
                    row.appendChild(topicCell);

                    // Details (Deadline, Homework, Submission)
                    const detailsCell = document.createElement('td');
                    detailsCell.innerHTML = `
                        <div class="display-container">
                            <div>Deadline: ${new Date(note.deadline).toLocaleDateString('en-UK', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                            <form action="/tutor/homework/deadline" method="POST">
                                <input type="hidden" name="homeworkId" value="${note._id}">
                                <a href="#" onclick="this.closest('form').submit();" style="font-style: italic;">Change</a>
                            </form>
                        </div>
                        <div class="display-container">
                            <div>Questions....</div>
                            <form action="/tutor/homework/question" method="POST">
                                <input type="hidden" name="homeworkId" value="${note._id}">
                                <a href="#" onclick="this.closest('form').submit();" style="font-style: italic;">View/Change</a>
                            </form>
                        </div>
                        <div class="display-container">
                            ${note.submission ? `
                                <div>Student Submission [Added]....</div>
                                <form action="/tutor/homework/submission" method="POST">
                                    <input type="hidden" name="homeworkId" value="${note._id}">
                                    <a href="#" onclick="this.closest('form').submit();" style="font-style: italic;">View</a>
                                </form>` : 'Student Submission [Not added]'}
                        </div>`;
                    row.appendChild(detailsCell);

                    // Score
                    const scoreCell = document.createElement('td');
                    scoreCell.innerHTML = note.score > 0 ? `
                        <div>${note.score}%</div>
                        <form action="/tutor/homework/score" method="POST">
                            <input type="hidden" name="homeworkId" value="${note._id}">
                            <a href="#" onclick="this.closest('form').submit();" style="font-style: italic;">Change</a>
                        </form>` : `
                        <div>${note.score}%</div>
                        <form action="/tutor/homework/score" method="POST">
                            <input type="hidden" name="homeworkId" value="${note._id}">
                            <a href="#" onclick="this.closest('form').submit();" style="font-style: italic;">Add Score</a>
                        </form>`;
                    row.appendChild(scoreCell);


                    // Append the row to the table body
                    homeworkBody.appendChild(row);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching homework:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Failed to load homework.';
            errorMessage.classList.add('error');
            document.getElementById('message').appendChild(errorMessage);
        });
});

document.getElementById('homework-btn').addEventListener('click', function() {
    window.location.href = '/tutor/addHomework.html';
});