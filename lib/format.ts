/** Sana va sonlarni o'zbekcha ko'rinishda chiqarish. */

const MONTHS = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

const MONTHS_SHORT = [
    "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
    "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
];

/**
 * Sayt vaqti — har doim Toshkent.
 *
 * Sahifa serverda (Docker, UTC) ham, brauzerda ham chiziladi. `getHours()`
 * ishlayotgan joyning soatini oladi: serverda 10:00 tadbir 05:00 bo'lib
 * chiqardi. Shuning uchun sana qismlarini aniq Toshkent vaqti bo'yicha olamiz.
 */
export const SITE_TIME_ZONE = "Asia/Tashkent";

const PARTS = new Intl.DateTimeFormat("en-GB", {
    timeZone: SITE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

/** Toshkent vaqti bo'yicha: yil, oy (1–12), kun, soat, daqiqa. */
export function tashkentParts(value: string | Date) {
    const parts: Record<string, number> = {};
    for (const part of PARTS.formatToParts(new Date(value))) {
        if (part.type !== "literal") parts[part.type] = Number(part.value);
    }
    return {
        year: parts.year,
        month: parts.month,
        day: parts.day,
        hour: parts.hour,
        minute: parts.minute,
    };
}

const pad = (value: number) => String(value).padStart(2, "0");

export function formatDate(value: string | Date) {
    const { year, month, day } = tashkentParts(value);
    return `${day}-${MONTHS[month - 1]}, ${year}`;
}

export function formatShortDate(value: string | Date) {
    const { year, month, day } = tashkentParts(value);
    return `${pad(day)}.${pad(month)}.${year}`;
}

export function dayAndMonth(value: string | Date) {
    const { month, day } = tashkentParts(value);
    return { day: pad(day), month: MONTHS_SHORT[month - 1] };
}

export function formatTime(value: string | Date) {
    const { hour, minute } = tashkentParts(value);
    return `${pad(hour)}:${pad(minute)}`;
}

/**
 * `datetime-local` maydoni uchun: ISO -> `2026-09-23T10:00` (Toshkent vaqti).
 * Saqlanganda Django uni ham Toshkent vaqti deb o'qiydi (TIME_ZONE).
 */
export function toTashkentInput(value: string | Date | null | undefined) {
    if (!value) return "";
    const { year, month, day, hour, minute } = tashkentParts(value);
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

/**
 * Sanagacha necha kun qoldi — Toshkent kalendari bo'yicha.
 * 0 — bugun oxirgi kun, manfiy — o'tib ketgan.
 */
export function daysUntil(value: string | null | undefined) {
    if (!value) return null;
    const today = tashkentParts(new Date());
    const [year, month, day] = value.slice(0, 10).split("-").map(Number);
    const target = Date.UTC(year, month - 1, day);
    const start = Date.UTC(today.year, today.month - 1, today.day);
    return Math.round((target - start) / 86_400_000);
}

/** `date` maydoni uchun: ISO -> `2026-09-23` (Toshkent sanasi). */
export function toTashkentDate(value: string | Date | null | undefined) {
    if (!value) return "";
    const { year, month, day } = tashkentParts(value);
    return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Bezash belgilarisiz matn — kartadagi qisqa ko'rinish uchun
 * («**g'oya» emas, «g'oya» chiqsin).
 */
export function plainText(text: string) {
    return text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^\s*(#{1,3}\s+|>>\s*|-\s+|---+\s*$)/gm, "")
        .replace(/\*\*|\*/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * 12345 -> "12 345" (ajratuvchi — uzilmaydigan bo'sh joy).
 *
 * `Intl` ishlatilmaydi: Node `1 234` (U+00A0), Chrome esa o'zbek tili
 * ma'lumotisiz `1,234` beradi — server va brauzer matni farq qilib, React
 * sahifani «jonlantirishda» xato berardi. Qo'lda yozilgani hamma joyda bir xil.
 */
export function formatNumber(value: number) {
    const [whole, fraction] = String(Math.abs(value)).split(".");
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${value < 0 ? "-" : ""}${grouped}${fraction ? `,${fraction}` : ""}`;
}

/** 150000000 -> "150 mln so'm", 1200000000 -> "1,2 mlrd so'm" */
export function formatMoney(value: number | string | null | undefined) {
    const amount = Number(value);
    if (!amount) return "";

    const short = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");

    if (amount >= 1_000_000_000) return `${short(amount / 1_000_000_000)} mlrd so'm`;
    if (amount >= 1_000_000) return `${short(amount / 1_000_000)} mln so'm`;
    return `${formatNumber(amount)} so'm`;
}

/**
 * Qidiruv va solishtirish uchun matn kaliti: kichik harf, tutuq belgilarisiz
 * (o', g', o‘, oʻ — hammasi bir xil), bo'shliqlar bitta. «Bog'ishamol»,
 * «Bog’ishamol» va «Bogishamol» bir-biriga mos keladi.
 */
export function foldText(text: string) {
    return text
        .toLowerCase()
        .replace(/['`´ʻʼ‘’]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
