function autoCompleteDescription() {
    const idTypes = [
        "Passport", 
        "Driving Licence", 
        "Biometric Residence Card", 
        "National Identity Card", 
        "Travel Document", 
        "Birth/Adoption certificate"
    ];

    function handleInput(e) {
        const inputField = e.target;
        const inputValue = inputField.value.toLowerCase();
        const suggestionsContainer = document.getElementById('descriptionSuggestions');
        suggestionsContainer.innerHTML = '';

        if (inputValue) {
            const filteredidTypes = idTypes.filter(topic => topic.toLowerCase().includes(inputValue));
            filteredidTypes.forEach((topic, index) => {
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
            suggestionsContainer.style.display = filteredidTypes.length ? 'block' : 'none';
        } else {
            suggestionsContainer.style.display = 'none';
        }

        // Reset active index for keyboard navigation
        inputField.dataset.activeIndex = -1;
    }

    function handleKeydown(e) {
        const inputField = e.target;
        const suggestionsContainer = document.getElementById('descriptionSuggestions');
        const suggestions = Array.from(suggestionsContainer.children);
        const activeIndex = parseInt(inputField.dataset.activeIndex, 10) || -1;

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
                suggestionsContainer.style.display = 'none'; // Hide the suggestions after selection
            }
        }
    }

    function updateSuggestionFocus(suggestions, index) {
        suggestions.forEach((suggestion, i) => {
            suggestion.classList.toggle('selected', i === index);
        });
    }

    function handleClickOutside(e) {
        if (!e.target.closest('.autocomplete-container')) {
            document.getElementById('descriptionSuggestions').style.display = 'none';
        }
    }

    // Attach event listeners
    document.querySelectorAll('.notesContainerInput').forEach(input => {
        input.addEventListener('input', handleInput);
        input.addEventListener('keydown', handleKeydown);
    });

    // Handle clicks outside the autocomplete suggestions to close the dropdown
    document.addEventListener('click', handleClickOutside);
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', autoCompleteDescription);
