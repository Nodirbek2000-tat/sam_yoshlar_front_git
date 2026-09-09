/**
 * Kategoriya -> rang ohangi.
 *
 * Backend `ic-money` ko'rinishidagi ikonka kalitini yuboradi. Shu kalit
 * bo'yicha ohang tanlanadi, ohang esa CSS o'zgaruvchilarini almashtiradi
 * (`app/globals.css` dagi `.tone-*` sinflari).
 *
 * Ro'yxatda yo'q kalit ham rangsiz qolmaydi: nomidan barqaror son olinib,
 * paletdan bittasi tanlanadi. Shunda backendga yangi tur qo'shilsa ham
 * kartalar bir xil kulrang bo'lib qolmaydi.
 */

export const TONES = [
    "emerald",
    "teal",
    "cyan",
    "blue",
    "indigo",
    "violet",
    "pink",
    "rose",
    "orange",
    "amber",
    "lime",
    "slate",
] as const;

export type Tone = (typeof TONES)[number];

/** Ikonka kaliti -> ohang. Kalitlar `ic-` prefiksisiz. */
const BY_ICON: Record<string, Tone> = {
    money: "emerald",
    card: "emerald",
    chart: "emerald",
    seedling: "lime",
    wheat: "amber",
    graduation: "indigo",
    books: "indigo",
    news: "blue",
    globe: "blue",
    computer: "cyan",
    video: "cyan",
    microscope: "cyan",
    rocket: "orange",
    fire: "orange",
    spark: "amber",
    bulb: "amber",
    star: "amber",
    trophy: "rose",
    target: "rose",
    heart: "rose",
    stethoscope: "pink",
    users: "violet",
    chat: "violet",
    megaphone: "violet",
    bell: "violet",
    briefcase: "amber",
    package: "amber",
    cart: "amber",
    truck: "amber",
    building: "slate",
    bank: "violet",
    shield: "teal",
    check: "teal",
    vote: "teal",
    clipboard: "teal",
    settings: "slate",
    pin: "slate",
    calendar: "blue",
    mail: "blue",
    question: "cyan",
    alert: "rose",
    ban: "rose",
};

/** Nomdan barqaror son — har safar bir xil rang chiqishi uchun. */
function hash(value: string) {
    let total = 0;
    for (let i = 0; i < value.length; i += 1) {
        total = (total * 31 + value.charCodeAt(i)) >>> 0;
    }
    return total;
}

/** `ic-money` yoki `money` -> `"emerald"`. */
export function toneOf(slug: string | undefined | null): Tone {
    if (!slug) return "slate";
    const key = slug.replace(/^ic-/, "");
    return BY_ICON[key] ?? TONES[hash(key) % (TONES.length - 1)];
}

/** Tailwind sinfi sifatida: `tone-emerald`. */
export function toneClass(slug: string | undefined | null): string {
    return `tone-${toneOf(slug)}`;
}
