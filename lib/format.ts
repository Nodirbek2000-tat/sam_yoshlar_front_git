/** Sana va sonlarni o'zbekcha ko'rinishda chiqarish. */

const MONTHS = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

const MONTHS_SHORT = [
    "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
    "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
];

export function formatDate(value: string | Date) {
    const date = new Date(value);
    return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

export function formatShortDate(value: string | Date) {
    const date = new Date(value);
    return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

export function dayAndMonth(value: string | Date) {
    const date = new Date(value);
    return { day: String(date.getDate()).padStart(2, "0"), month: MONTHS_SHORT[date.getMonth()] };
}

export function formatTime(value: string | Date) {
    const date = new Date(value);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** 12345 -> "12 345" */
export function formatNumber(value: number) {
    return new Intl.NumberFormat("uz-UZ").format(value).replace(/,/g, " ");
}
