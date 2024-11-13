async function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year = date.getFullYear();
    const weekday = date.toLocaleString('en-GB', { weekday: 'long' });

    const daySuffix = (day) => {
        if (day > 3 && day < 21) return 'th'; // covers 11th to 20th
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    return `${weekday}, ${day}${daySuffix(day)} ${month} ${year}`;
}

module.exports = formatDate;