// Convert text to upper case
export const toUpperName = (name) => {
    const uppered = name.charAt(0).toUpperCase() + name.slice(1);
    return uppered;
}