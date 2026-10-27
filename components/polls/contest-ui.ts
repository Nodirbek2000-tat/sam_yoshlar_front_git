import type { Poll, PollCategory, PollOption } from "@/lib/types";

/**
 * Yo'nalishli so'rovnoma (yetakchilar tanlovi) uchun umumiy bo'laklar:
 * har yo'nalishning o'z rangi, tayyor 6 ta nominatsiya.
 */

const TONES = [
    "tone-emerald",
    "tone-violet",
    "tone-blue",
    "tone-amber",
    "tone-rose",
    "tone-cyan",
    "tone-indigo",
    "tone-teal",
    "tone-orange",
    "tone-pink",
    "tone-lime",
] as const;

/** Yo'nalish rangi — tartib raqami bo'yicha (sahifada ham, panelda ham bir xil). */
export const nominationTone = (index: number) => TONES[Math.max(0, index) % TONES.length];

export const nominationEmoji = (category: Pick<PollCategory, "emoji"> | undefined) =>
    category?.emoji || "🏆";

/** Panelda bir bosishda qo'shiladigan yetakchilar tanlovi yo'nalishlari. */
export const LEADERS_PRESET: { title: string; emoji: string }[] = [
    { emoji: "💼", title: "Eng ko'p yoshni ish bilan ta'minlagan yetakchi" },
    { emoji: "🚀", title: "Eng ko'p yoshni tadbirkorlikka jalb qilgan yetakchi" },
    { emoji: "🏗️", title: "Eng ko'p yoshlar loyihasini amalga oshirgan yetakchi" },
    { emoji: "🎓", title: "Ta'lim va kasbiy rivojiga hissa qo'shgan yetakchi" },
    { emoji: "💰", title: "Eng ko'p yoshga yangi daromad manbai yaratgan yetakchi" },
    { emoji: "⚡", title: "Eng faol yoshlar yetakchisi" },
];

/** Yo'nalishi yo'q (eski) nomzodlar uchun qo'shimcha guruh. */
export const OTHER_ID = 0;

/**
 * Sahifadagi yo'nalishlar ro'yxati. Yo'nalishsiz nomzod bo'lsa —
 * oxirida «Boshqa nomzodlar» guruhi.
 */
export function nominationsOf(poll: Pick<Poll, "categories" | "options" | "show_results">): PollCategory[] {
    const list = [...(poll.categories ?? [])];
    const loose = poll.options.filter((option) => !option.category);
    if (list.length && loose.length) {
        list.push({
            id: OTHER_ID,
            title: "Boshqa nomzodlar",
            emoji: "✨",
            options_count: loose.length,
            total_votes: poll.show_results
                ? loose.reduce((sum, option) => sum + (option.votes ?? 0), 0)
                : null,
        });
    }
    return list;
}

export const inNomination = (option: PollOption, id: number) =>
    (option.category ?? OTHER_ID) === id;
