

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('zoom');
  
    if (sessionId) {
      try {
        const response = await fetch('/tutor/getZoomLink', {});
  
        const result = await response.json();
        
  
        if (result.error) {
          messageElement.textContent = "Zoom not loaded";
        } else {
          
          const notesWindow = window.open(result.link, '_blank');
  
          if (!notesWindow || notesWindow.closed || typeof notesWindow.closed == 'undefined') { 
              alert("Pop-up blocked! Please allow pop-ups for this site.");
          }
        }
      } catch (error) {
        console.log(error);
        messageElement.textContent = "Error loading zoom file";
      }
    }
  });
  