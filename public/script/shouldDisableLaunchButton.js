function enableLaunchButton(bookingDate, bookingDuration) {
    const now = new Date();

    const bookingDateTime = new Date(bookingDate);

    const bookingYear = bookingDateTime.getUTCFullYear();
    const bookingMonth = bookingDateTime.getUTCMonth();
    const bookingDay = bookingDateTime.getUTCDate();
    const bookingTime = 60*(bookingDateTime.getUTCHours() -1) + bookingDateTime.getUTCMinutes();

    const nowYear = now.getUTCFullYear();
    const nowMonth = now.getUTCMonth();
    const nowDay = now.getUTCDate();
    const nowTime = now.getUTCHours() * 60 + now.getUTCMinutes();

    const lowerBoundTime = bookingTime - 10;
    const upperBoundTime = bookingTime + bookingDuration; 

    if (nowYear === bookingYear && nowMonth === bookingMonth && nowDay === bookingDay) {        
        return nowTime >= lowerBoundTime && nowTime <= upperBoundTime;
    }

    return false;
}
