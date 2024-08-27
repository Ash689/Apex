var fileShown = true;
document.getElementById('documentOrText').addEventListener("click", async function (e) {
    e.preventDefault();
    var homework2Elements = document.getElementById('append_homework');
    if(fileShown){
        document.getElementById('documentOrText').textContent = "Add File";
        homework2Elements.innerHTML =`
            <h4>Enter Homework:
                <span id = "info-button3" class="info-button">ℹ️</span> 
            </h4>
            <textarea class = "generatedQuestions" id="generatedQuestions" name="generatedQuestions" placeholder="Enter Text" maxlength="200"></textarea>
            <h4>AI Generated Homework
                <span id = "info-button4" class="info-button">ℹ️</span>
            </h4>
            <input type="text" id="questionTopics" name="questionTopics" placeholder="Topic Entry" maxlength = "200">
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

document.getElementById('info-button2').title = "Add File: Add a document or homework file." + "\n" + "Add Text: Type your questions.";