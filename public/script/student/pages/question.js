fetch('/student/questionFile')
.then(response => response.json())
.then(files => {
    const fileList = document.getElementById('fileList');
    files.forEach(file => {
        const listItem = document.createElement('div'); // Create a div for each file item

        if (file.isText){
            const textArea = document.createElement('textarea');
            textArea.readOnly = "readonly";
            textArea.maxLength = "300";
            textArea.value = file.originalname;
            listItem.appendChild(textArea);
        }
        // Create preview based on file type
        else if (file.mimetype.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = `/uploads/homeworkFiles/tutor/${file.filename}`;
            img.alt = file.originalname;
            img.style.width = '200px';
            listItem.appendChild(img);
            const downloadLink = document.createElement('a');
            downloadLink.href = `/uploads/homeworkFiles/tutor/${file.filename}`;
            downloadLink.style = "text-decoration: underline"
            downloadLink.textContent = `Download ${file.originalname}`;
            downloadLink.download = file.originalname;
            listItem.appendChild(downloadLink);
        } else if (file.mimetype === 'application/pdf') {
            const embed = document.createElement('embed');
            embed.src = `/uploads/${file.filename}`;
            embed.type = 'application/pdf';
            embed.width = '200px';
            embed.height = '200px';
            listItem.appendChild(embed);
            const downloadLink = document.createElement('a');
            downloadLink.href = `/uploads/homeworkFiles/tutor/${file.filename}`;
            downloadLink.textContent = `Download ${file.originalname}`;
            downloadLink.style = "text-decoration: underline"
            downloadLink.download = file.originalname;
            listItem.appendChild(downloadLink);
        } else {
            const link = document.createElement('a');
            link.href = `/uploads/${file.filename}`;
            link.textContent = file.originalname;
            listItem.appendChild(link);
        }

        fileList.appendChild(listItem); // Append the div to the fileList container
    });
});