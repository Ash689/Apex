const subjects = [
    "English",
    "Math",
    "Science",
    "History",
    "Geography",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "Literature",
    "Spanish",
    "French",
    "Business Studies",
    "Italian",
    "German",
    "Religious Studies",
    "Language",
    "Languages",
];


function handleInput(e) {
    const inputField = e.target;
    const inputValue = inputField.value.toLowerCase();
    const suggestionsContainer = inputField.nextElementSibling;
    suggestionsContainer.innerHTML = '';

    if (inputValue) {
        const filteredsubjects = subjects.filter(topic => topic.toLowerCase().includes(inputValue));
        filteredsubjects.forEach((topic, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.classList.add('autocomplete-suggestion');
            suggestionElement.textContent = topic;
            suggestionElement.dataset.index = index; // Store index for navigation
            suggestionElement.addEventListener('click', function() {
                inputField.value = topic;
                suggestionsContainer.innerHTML = '';
            });
            suggestionsContainer.appendChild(suggestionElement);
        });
        suggestionsContainer.style.display = filteredsubjects.length ? 'block' : 'none';
    } else {
        suggestionsContainer.style.display = 'none';
    }

    // Handle keyboard navigation
    inputField.dataset.activeIndex = -1;
}

function handleKeydown(e) {
    const inputField = e.target;
    const suggestionsContainer = inputField.nextElementSibling;
    const suggestions = Array.from(suggestionsContainer.children);
    const activeIndex = parseInt(inputField.dataset.activeIndex, 10);

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex < suggestions.length - 1) {
            inputField.dataset.activeIndex = activeIndex + 1;
            updateSuggestionFocus(suggestions, activeIndex + 1);
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) {
            inputField.dataset.activeIndex = activeIndex - 1;
            updateSuggestionFocus(suggestions, activeIndex - 1);
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
            const selectedSuggestion = suggestions[activeIndex];
            inputField.value = selectedSuggestion.textContent;
            suggestionsContainer.innerHTML = '';
        }
    }
}

function updateSuggestionFocus(suggestions, index) {
    suggestions.forEach((suggestion, i) => {
        suggestion.classList.toggle('selected', i === index);
    });
}

function handleClickOutside(e) {
    if (!e.target.matches('.notesContainerInput')) {
        document.querySelectorAll('.autocomplete-suggestions').forEach(container => container.style.display = 'none');
    }
}

document.querySelectorAll('.notesContainerInput').forEach(input => {
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeydown);
});