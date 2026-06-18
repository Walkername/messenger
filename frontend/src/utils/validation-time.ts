
export const formatTimeShort = (dateString: string) => {
    const dateObj: Date = new Date(dateString);
    return dateObj.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const formatMessageTimeShort = (dateString: string) => {
    const dateObj: Date = new Date(dateString);
    return dateObj.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};

export const formatTimeLong = (dateString: string) => {
    const dateObj: Date = new Date(dateString);
    return dateObj.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};