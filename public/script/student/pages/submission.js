fetch('/student/homeworkFile')
.then(response => response.json())
.then(files => {
    const fileList = document.getElementById('fileList');
    files.forEach(file => {
        const listItem = document.createElement('div'); // Create a div for each file item
        if (file.isText){
            const textArea = document.createElement('textarea');
            textArea.readOnly = "readonly";
            textArea.maxlength="300";
            textArea.value = file.originalname;
            listItem.appendChild(textArea);
        }
        // Create preview based on file type
        else if (file.mimetype.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = `uploads/homeworkFiles/student/${file.filename}`;
            img.alt = file.originalname;
            img.style.width = '200px';
            listItem.appendChild(img);
            const downloadLink = document.createElement('a');
            downloadLink.href = `/uploads/homeworkFiles/student/${file.filename}`;
            downloadLink.textContent = `Download ${file.originalname}`;
            downloadLink.style = "text-decoration: none"
            downloadLink.download = file.originalname;
            listItem.appendChild(downloadLink);
        } else if (file.mimetype === 'application/pdf') {
            const embed = document.createElement('embed');
            embed.src = `/uploads/homeworkFiles/student/${file.filename}`;
            embed.type = 'application/pdf';
            embed.width = '200px';
            embed.height = '200px';
            listItem.appendChild(embed);
            const downloadLink = document.createElement('a');
            downloadLink.href = `/uploads/homeworkFiles/student/${file.filename}`;
            downloadLink.textContent = `Download ${file.originalname}`;
            downloadLink.style = "text-decoration: none"
            downloadLink.download = file.originalname;
            listItem.appendChild(downloadLink);
        } else {
            const link = document.createElement('a');
            link.href = `/uploads/${file.filename}`;
            link.textContent = file.originalname;
            listItem.appendChild(link);
        }

        // Create delete button
            // Create delete button
        const deleteButton = document.createElement('p');
        deleteButton.innerHTML = ` 
        <form action="/student/deleteHomeworkFile" method="POST">
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
            <textarea class = "generatedAnswer" id="generatedAnswer" name="generatedAnswer" placeholder="Enter Text" required></textarea>
        `; 
    } else{
        document.getElementById('documentOrText').textContent = "Add Text";
    
        homework2Elements.innerHTML = `
            <input type="file" name="document">
        `;
    }
    fileShown = !fileShown;


});