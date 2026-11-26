export function getPhilippineDate(): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find(
        (p) => p.type === "year"
    )?.value;

    const month = parts.find(
        (p) => p.type === "month"
    )?.value;

    const day = parts.find(
        (p) => p.type === "day"
    )?.value;

    return `${year}-${month}-${day}`;
}

export function formatQueueNumber(
    number: number
): string {
    return String(number).padStart(3, "0");
}