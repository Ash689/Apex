document.addEventListener('DOMContentLoaded', () => {
const homeworkBody = document.getElementById('homeworkBody');

fetch('/student/getHomework')
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
                </div>
                <div class="display-container">
                    <div>Question....</div>
                        <form action="homework/question" method="POST">
                            <input type="hidden" name="homeworkId" value="${note._id}">
                            <a href="#" onclick="this.closest('form').submit();" style="font-style: italic;">View</a>
                        </form>
                </div>
                <div class="display-container">
                    ${note.submission ? `
                        <div>Student Submission [Added]....</div>
                        <form action="homework/submission" method="POST">
                            <input type="hidden" name="homeworkId" value="${note._id}">
                            <a href="#" onclick="this.closest('form').submit();" style="font-style: italic;">View/Change</a>
                        </form>
                        ` : `<div>Student Submission [Not added]</div>
                        <form action="homework/submission" method="POST">
                            <input type="hidden" name="homeworkId" value="${note._id}">
                            <a href="#" onclick="this.closest('form').submit();" style="font-style: italic;">Add</a>
                        </form>`}
                </div>`;
            row.appendChild(detailsCell);

            // Score
            const scoreCell = document.createElement('td');
            scoreCell.innerHTML = `<div>${note.score}%</div>`;
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