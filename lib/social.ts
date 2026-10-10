/** Ijtimoiy holat — backenddagi `SocialStatus` bilan bir xil kalitlar. */
export type SocialStatus = "student" | "school" | "employed" | "unemployed";

export const SOCIAL_STATUSES: {
    value: SocialStatus;
    /** Formadagi tanlov matni (birinchi shaxsda) */
    choice: string;
    /** Profil va paneldagi ko'rinishi */
    label: string;
    tone: string;
    /** O'qiydiganlar uchun: o'qish joyi maydonining nomi */
    place?: string;
    placeholder?: string;
}[] = [
    {
        value: "student",
        choice: "Talabaman",
        label: "Talaba",
        tone: "blue",
        place: "Universitetingiz nomi",
        placeholder: "Masalan: Samarqand davlat universiteti",
    },
    {
        value: "school",
        choice: "Maktab o'quvchisiman",
        label: "Maktab o'quvchisi",
        tone: "amber",
        place: "Maktabingiz nomi",
        placeholder: "Masalan: Urgut tumani 12-maktab",
    },
    { value: "employed", choice: "Ishlayapman", label: "Ishlaydi", tone: "emerald" },
    { value: "unemployed", choice: "Ishsizman", label: "Ishsiz", tone: "rose" },
];

export const isStudying = (value: string) => value === "student" || value === "school";

export const socialOf = (value: string) => SOCIAL_STATUSES.find((item) => item.value === value);
