// Convert Time to 12-hour format
export const to12Hour = (time24) => {
    const [hour, minute, second] = time24.split(':');
    const date = new Date();
    date.setHours(hour, minute, second);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const to12HourV2 = (time24) => {
    const [hour, minute] = time24.split(':');
    const date = new Date();
    date.setHours(hour, minute);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const to24HourNow = () => {
    const now = new Date();

    // Explicitly setting hour12: false with 'en-US' locale
    const militaryTimeUS = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return militaryTimeUS;
}