"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";
import type { ProblemQuestion } from "@/lib/types";

/**
 * Tashkilot muammo yozadi.
 *
 * Anketaning o'nta savolidan bittasi tanlanadi va unga javob yoziladi.
 * Bu forma faqat tashkilot hisobiga ko'rinadi — ruxsatni Django ham
 * tekshiradi, bu yerdagisi qulaylik uchun.
 */
export function ProblemForm({ questions }: { questions: ProblemQuestion[] }) {
    const router = useRouter();
    const [picked, setPicked] = useState<ProblemQuestion | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<number | null>(null);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || !picked) return;

        const description = String(new FormData(event.currentTarget).get("description") ?? "");
        setBusy(true);
        setError(null);

        try {
            const response = await fetch("/api/proxy/problems/yozish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: picked.value, description }),
            });

            if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as Record<
                    string,
                    string[] | string
                > | null;
                const first = payload ? Object.values(payload)[0] : null;
                setError(
                    Array.isArray(first) ? first[0] : ((first as string) ?? "Yuborib bo'lmadi."),
                );
                return;
            }

            const created = (await response.json()) as { id?: number };
            setDone(created.id ?? 0);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
        }
    }

    if (done !== null) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass mx-auto max-w-lg rounded-2xl p-8 text-center"
            >
                <span className="tone-emerald mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft">
                    <Icon name="check" size={26} className="text-tone-text" strokeWidth={2} />
                </span>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                    Muammoingiz e&apos;lon qilindi
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
                    Endi yoshlar unga yechim taklif qila oladi. Har bir yangi taklif
                    kabinetingizga tushadi va bildirishnoma keladi.
                </p>

                <div className="mt-7 flex flex-wrap justify-center gap-2">
                    <Link
                        href={done ? `/tashabbuslar/muammolar/${done}` : "/tashabbuslar/muammolar"}
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                    >
                        Ko&apos;rish
                        <Icon name="arrowRight" size={14} />
                    </Link>
                    <Link
                        href="/kabinet/muammolarim"
                        className="rounded-full border border-line px-5 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text"
                    >
                        Muammolarim
                    </Link>
                </div>
            </motion.div>
        );
    }

    return (
        <form onSubmit={submit} className="max-w-3xl">
            <h2 className="text-[15.5px] font-semibold tracking-tight">
                Qaysi savolga javob yozmoqchisiz?
            </h2>
            <p className="mt-1.5 text-[13.5px] text-muted">
                O&apos;nta savol bor — o&apos;zingizga eng mos kelganini tanlang.
            </p>

            <div className="mt-5 grid gap-2">
                {questions.map((item) => {
                    const active = picked?.value === item.value;

                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setPicked(item)}
                            className={cn(
                                toneClass(item.icon),
                                "flex items-start gap-3.5 rounded-xl border p-4 text-left transition-colors duration-200",
                                active
                                    ? "border-tone-line bg-tone-soft"
                                    : "border-line hover:border-tone-line hover:bg-tone-soft",
                            )}
                        >
                            <CategoryTile slug={item.icon} size="sm" />

                            <span className="min-w-0 flex-1">
                                <span className="block text-[12px] font-medium uppercase tracking-[0.08em] text-tone-text">
                                    {item.number}. {item.short}
                                </span>
                                <span className="mt-1 block text-[13.5px] leading-relaxed">
                                    {item.label}
                                </span>
                            </span>

                            <span
                                className={cn(
                                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                                    active ? "border-tone bg-tone text-page" : "border-line",
                                )}
                            >
                                {active && <Icon name="check" size={12} strokeWidth={3} />}
                            </span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence>
                {picked && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pt-7">
                            <label className="block">
                                <span className="text-[13px] font-medium">Javobingiz</span>
                                <span className="mt-1 block text-[12.5px] text-muted">
                                    Aniq yozing: nima bo&apos;lyapti, qanchadan beri, kimga
                                    ta&apos;sir qilyapti. Raqam bo&apos;lsa — yozing.
                                </span>
                                <textarea
                                    name="description"
                                    required
                                    rows={8}
                                    minLength={40}
                                    placeholder="Masalan: Hosilni saqlaydigan sovuq ombor yo'q. Pomidor uch kunda sotilishi kerak, aks holda nobud bo'ladi. Shu sababli yozda daromad 30 foizga kamayadi."
                                    className="mt-3 w-full resize-y rounded-xl border border-line bg-page px-3.5 py-2.5 text-[14px] leading-relaxed outline-none transition-colors placeholder:text-faint focus:border-accent"
                                />
                            </label>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-[13px] text-warn-text">
                    <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                    type="submit"
                    disabled={busy || !picked}
                    className="inline-flex items-center gap-2 rounded-full bg-invert px-6 py-3 text-[14.5px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {busy ? "Yuborilmoqda…" : "Muammoni e'lon qilish"}
                    {!busy && <Icon name="arrowRight" size={15} />}
                </button>

                {!picked && <span className="text-[13px] text-faint">Avval savolni tanlang</span>}
            </div>
        </form>
    );
}
