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
