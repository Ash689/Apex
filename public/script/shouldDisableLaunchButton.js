function shouldDisableLaunchButton(bookingDate, bookingTime, bookingDuration) {
    const formatDate = new Date(new Date(bookingDate).getTime() - 1000*60*60);
    const now = new Date();

    const lowerBound = new Date(now.getTime() - 10 * 60 * 1000); // Subtract 10 minutes
    const upperBound = new Date(now.getTime() + bookingDuration * 60 * 1000); // Add 40 minutes

    return formatDate < lowerBound || formatDate > upperBound;
}