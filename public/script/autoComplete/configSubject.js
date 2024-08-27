function setupAutocomplete(inputFieldId, suggestionsArray, suggestionContainerId) {
    const inputField = document.getElementById(inputFieldId);
    const suggestionsContainer = document.getElementById(suggestionContainerId);

    function handleInput(e) {
        const inputValue = inputField.value.toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (inputValue) {
            const filteredSuggestions = suggestionsArray.filter(item =>
                item.toLowerCase().includes(inputValue)
            );
            filteredSuggestions.forEach((item, index) => {
                const suggestionElement = document.createElement('div');
                suggestionElement.classList.add('autocomplete-suggestion');
                suggestionElement.textContent = item;
                suggestionElement.dataset.index = index;
                suggestionElement.addEventListener('click', function () {
                    inputField.value = item;
                    suggestionsContainer.innerHTML = '';
                });
                suggestionsContainer.appendChild(suggestionElement);
            });
            suggestionsContainer.style.display = filteredSuggestions.length ? 'block' : 'none';
        } else {
            suggestionsContainer.style.display = 'none';
        }

        inputField.dataset.activeIndex = -1;
    }

    function handleKeydown(e) {
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

    inputField.addEventListener('input', handleInput);
    inputField.addEventListener('keydown', handleKeydown);
}

function handleClickOutside(e) {
    if (!e.target.matches('.notesContainerInput')) {
        document.querySelectorAll('.autocomplete-suggestions').forEach(container => container.style.display = 'none');
    }
}

document.addEventListener('click', handleClickOutside);

// Set up autocomplete for each field except Teaching Approach
setupAutocomplete('subject', subjects, 'subjectSuggestions');
setupAutocomplete('qualification', qualifications, 'qualificationSuggestions');
setupAutocomplete('studyExamBoard', examBoards, 'examBoardSuggestions');
setupAutocomplete('grade', grades, 'gradeSuggestions');
