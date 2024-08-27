fetch('/tutor/homeworkFile')
.then(response => response.json())
.then(files => {
    const fileList = document.getElementById('fileList');
    files.forEach(file => {
        const listItem = document.createElement('div'); // Create a div for each file item
        // Create preview based on file type
        if (file.isText){
            const textArea = document.createElement('textarea');
            textArea.readOnly = "readonly";
            textArea.maxLength="300";
            textArea.value = file.originalname;
            listItem.appendChild(textArea);
        }
        else if (file.mimetype.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = `/uploads/homeworkFiles/tutor/${file.filename}`;
            img.alt = file.originalname;
            listItem.appendChild(img);
            const downloadLink = document.createElement('a');
            downloadLink.href = `/uploads/homeworkFiles/tutor/${file.filename}`;
            downloadLink.textContent = `Download ${file.originalname}`;
            downloadLink.download = file.originalname;
            listItem.appendChild(downloadLink);
        } else if (file.mimetype === 'application/pdf') {
            const embed = document.createElement('embed');
            embed.src = `/uploads/homeworkFiles/tutor/${file.filename}`;
            embed.type = 'application/pdf';
            embed.width = '200px';
            embed.height = '200px';
            listItem.appendChild(embed);
            const downloadLink = document.createElement('a');
            downloadLink.href = `/uploads/homeworkFiles/tutor/${file.filename}`;
            downloadLink.textContent = `Download ${file.originalname}`;
            downloadLink.download = file.originalname;
            listItem.appendChild(downloadLink);
        } else {
            const link = document.createElement('a');
            link.href = `/uploads/${file.filename}`;
            link.textContent = file.originalname;
            listItem.appendChild(link);
        }
        const deleteButton = document.createElement('p');
        deleteButton.innerHTML = ` 
        <form action="/tutor/deleteHomeworkFile" method="POST">
            <input type="hidden" name="fileID" value="${file._id}">
            <button type="submit" class="secondary-button">Delete</button>
        </form>
        `;
        listItem.appendChild(deleteButton);

        fileList.appendChild(listItem); // Append the div to the fileList container
    });
});

var fileShown = true;
document.getElementById('documentOrText').addEventListener("click", async function (e) {
    e.preventDefault();
    var homework2Elements = document.getElementById('append_homework');
    if(fileShown){
        document.getElementById('documentOrText').textContent = "Add File";
        homework2Elements.innerHTML =`
            <h4>Enter Homework:</h4>
            <textarea class = "generatedQuestions" id="generatedQuestions" name="generatedQuestions" placeholder="Enter Text"></textarea>
            <h4>AI Generated Homework</h4>
            <input type="text" id="questionTopics" name="questionTopics" placeholder="Topic Entry" maxlength = "100">
            <input type="number" id="questionNumber" name="questionNumber" placeholder="Number of Questions [Max. 10]" min="1" max="10">
            <button type="button" class="secondary-button" id="generateQuestionButton">Generate</button>
        `;

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