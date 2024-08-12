async function formatInput(userInput) {
    // Step 1: Trim leading and trailing whitespace
    const trimmedInput = userInput.trim();

    // Step 2: Capitalize the first letter of every word
    const capitalizedInput = trimmedInput.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return capitalizedInput;
}
module.exports = formatInput;