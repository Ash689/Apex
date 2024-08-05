function shouldDisableLaunchButton(bookingDate, bookingTime, bookingDuration) {
    const currentDate = new Date();

    // Parse booking date and time
    const [hours, minutes] = bookingTime.split(':').map(Number);
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(hours);
    bookingDateTime.setMinutes(minutes);

    const lessonStartTime = new Date(bookingDateTime.getTime());
    lessonStartTime.setMinutes(lessonStartTime.getMinutes() - 10); // 10 minutes before the lesson start time

    const lessonEndTime = new Date(bookingDateTime.getTime());
    lessonEndTime.setMinutes(lessonEndTime.getMinutes() + bookingDuration); // End time based on duration

    return currentDate > lessonEndTime || currentDate < lessonStartTime;
}