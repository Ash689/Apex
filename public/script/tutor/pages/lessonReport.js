document.addEventListener('DOMContentLoaded', () => {
    const notesContainer = document.getElementById('notesContainer');
    const successfulTopics = document.getElementById('successfulTopics');
    const topicsToImprove = document.getElementById('topicsToImprove');
    
    const notesContainerInput = document.getElementById('notesContainerInput');
    const successfulTopicsInput = document.getElementById('successfulTopicsInput');
    const topicsToImproveInput = document.getElementById('topicsToImproveInput');
    
    document.getElementById('info-button').title = "✓: Topics went well." + "\n" + "✗: Topics to improve." + "\n" + "Add your own topics and edit the box as you will!";
    
    fetch('/tutor/getLessonNotes')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                const errorMessage = document.createElement('p');
                errorMessage.textContent = data.error;
                errorMessage.classList.add('error');
                notesContainer.appendChild(errorMessage);
            } else {
                const notes = data.notes;
                notes.forEach(note => {
                    const topicRow = document.createElement('div');
                    topicRow.classList.add('topic-row');
                    const topicText = document.createElement('span');
                    topicText.textContent = note;
                    topicRow.appendChild(topicText);
                    const tickButton = document.createElement('button');
                    tickButton.textContent = '✓';
                    tickButton.classList.add('tick');
                    tickButton.addEventListener('click', () => handleTickClick(note, topicRow));
                    const crossButton = document.createElement('button');
                    crossButton.textContent = '✗';
                    crossButton.classList.add('cross');
                    crossButton.addEventListener('click', () => handleCrossClick(note, topicRow));
                    topicRow.appendChild(tickButton);
                    topicRow.appendChild(crossButton);
                    notesContainer.appendChild(topicRow);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching lesson notes:', error);
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Failed to load lesson notes.';
            errorMessage.classList.add('error');
            notesContainer.appendChild(errorMessage);
        });

    function handleTickClick(note, topicRow) {
        moveToSection(topicRow, successfulTopics);
    }

    function handleCrossClick(note, topicRow) {
        moveToSection(topicRow, topicsToImprove);
    }

    function moveToSection(topicRow, targetColumn) {
        const topicText = topicRow.querySelector('span').textContent;
        const newTopicRow = document.createElement('div');
        newTopicRow.classList.add('topic-row');
        newTopicRow.innerHTML = `<span>${topicText}</span>`;
        targetColumn.appendChild(newTopicRow);
        topicRow.remove();
        if (notesContainer.childElementCount == 0) {
            fetch('/tutor/getLessonNotes')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    const errorMessage = document.createElement('p');
                    errorMessage.textContent = data.error;
                    errorMessage.classList.add('error');
                    notesContainer.appendChild(errorMessage);
                } else {
                    const notes = data.notes;
                    notes.forEach(note => {
                        const topicRow = document.createElement('div');
                        topicRow.classList.add('topic-row');
                        const topicText = document.createElement('span');
                        topicText.textContent = note;
                        topicRow.appendChild(topicText);
                        notesContainer.appendChild(topicRow);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching lesson notes:', error);
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'Failed to load lesson notes.';
                errorMessage.classList.add('error');
                notesContainer.appendChild(errorMessage);
            });
        }
    }

    // Capture the form submission
    document.getElementById('lessonReportForm').addEventListener('submit', function(event) {
        notesContainerInput.value = Array.from(notesContainer.children)
            .map(topicRow => topicRow.innerText.replace(/[✓✗]/g, '').trim())
            .join(', ');

        successfulTopicsInput.value = successfulTopics.innerText.replace(/[✓✗]/g, '').trim();
        topicsToImproveInput.value = topicsToImprove.innerText.replace(/[✓✗]/g, '').trim();
    });
});
var homeworkShown = false;
var fileShown = true;

document.getElementById('homework-btn').addEventListener('click', function() {
    var homeworkElements = document.getElementById('viewHomework');
    if(homeworkShown){
        document.getElementById('homework-btn').textContent = "Add Homework";
        homeworkElements.innerHTML =``;
        nameU = true;
        deadlineU = true;
        validSubmit();
    } else{
        document.getElementById('homework-btn').textContent = "Close Homework";
        nameU = false;
        deadlineU = false;
        validSubmit();
    
        homeworkElements.innerHTML = `
            <table id="homework-form" class="hidden">
                <tbody>
                    <tr>
                        <td>Name of topic</td>
                        <td>
                            <input type="text" name="topicName" id="topicNameInput" required>
                        </td>
                    </tr>
                    <tr>
                        <td>Homework File
                            <span id = "info-button2" class="info-button">ℹ️</span>
                        </td>
                        <td>
                            <button class = "secondary-button" type="button" id="documentOrText">Add Text</button>
                            <div id = "append_homework">
                                <input type="file" name="document">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Deadline</td>
                        <td>
                            <input style = "margin: 0px" type="date" id="deadline" name="deadline" required><br><br>
                        </td>
                    </tr>
                </tbody>
            </table>
        `;

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
        
        document.getElementById('info-button2').title = "Add File: Add a document or homework file." + "\n" + "Add Text: Type your questions.";

        document.getElementById('documentOrText').addEventListener("click", async function (e) {
            e.preventDefault();
            var homework2Elements = document.getElementById('append_homework');
            if(fileShown){
                document.getElementById('documentOrText').textContent = "Add File";
                homework2Elements.innerHTML =`
                    <h4>Enter Homework:
                        <span id = "info-button3" class="info-button">ℹ️</span>    
                    </h4>
                    <textarea rows="4" cols="60" class = "generatedQuestions" id="generatedQuestions" name="generatedQuestions" placeholder="Enter Text"></textarea>
                    <h4>AI Generated Homework    
                        <span id = "info-button4" class="info-button">ℹ️</span>   
                    </h4>
                    <input type="text" id="questionTopics" name="questionTopics" placeholder="Topic Entry" maxlength = "100">
                    <input type="number" id="questionNumber" name="questionNumber" placeholder="Number of Questions [Max. 10]" min="1" max="10">
                    <button type="button" class="secondary-button" id="generateQuestionButton">Generate</button>
                `;
                document.getElementById('info-button3').title = "Type the question in the textbox, or use AI to generate it for you!";
                document.getElementById('info-button4').title = "E.g. 'Topic Entry: 'GCSE Vectors' " + "\n" + "Number of questions: 3.";

                document.getElementById('generateQuestionButton').addEventListener("click", async function (e) {
                    e.preventDefault();
            
                    const aiHomeworkTopic = document.getElementById('questionTopics').value;
                    const aiHomeworkNumber = document.getElementById('questionNumber').value;
            
                    if (!aiHomeworkTopic || !aiHomeworkNumber) {
                        alert("Please enter a value for the homework topic and the number of questions");
                        return;
                    }
            
                    // AJAX request to the backend
                    fetch('/tutor/generateQuestions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            topic: aiHomeworkTopic,
                            number: aiHomeworkNumber
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            // Update the textarea with generated questions
                            const generatedQuestionsTextarea = document.getElementById('generatedQuestions');
                            generatedQuestionsTextarea.value = generatedQuestionsTextarea.value  + data.questions.join('\n');
                        } else {
                            alert('Error generating questions: ' + data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Failed to generate questions due to a server error.');
                    });
                });
            } else{
                document.getElementById('documentOrText').textContent = "Add Text";
            
                homework2Elements.innerHTML = `
                    <input type="file" name="document">
                `;
            }
            fileShown = !fileShown;


        });
        
    }
    
    homeworkShown = !homeworkShown;
});