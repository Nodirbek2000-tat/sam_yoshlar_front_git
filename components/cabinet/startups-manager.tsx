"use client";

import { Pencil } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { StatusBanner } from "@/components/cabinet/profile-editor";
import { Icon } from "@/components/icon";
import { StartupForm } from "@/components/onboarding/startup-form";
import { cn } from "@/lib/cn";
import type { Choice, StartupProfile } from "@/lib/types";

/**
 * Kabinetdagi «Startaplarim»: 3 tagacha startap.
 *
 * Har biri alohida karta — bosilganda ichida tahrirlash formasi ochiladi.
 * Limitgacha yangi startap qo'shish mumkin; birini o'chirsa, joy bo'shaydi.
 */

const STATUS_TONE: Record<string, string> = {
    pending: "amber",
    approved: "emerald",
    rejected: "rose",
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function StartupsManager({
    startups,
    limit,
    spheres,
    stages,
}: {
    startups: StartupProfile[];
    limit: number;
    spheres: Choice[];
    stages: Choice[];
}) {
    const router = useRouter();
    // Hali startap yo'q bo'lsa — forma darrov ochiq turadi
    const [open, setOpen] = useState<number | "new" | null>(startups.length ? null : "new");
    const [removing, setRemoving] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canAdd = startups.length < limit;

    async function remove(item: StartupProfile) {
        if (!confirm(`«${item.name}» startapi o'chirilsinmi? Buni qaytarib bo'lmaydi.`)) return;

        setRemoving(item.id);
        setError(null);
        try {
            const response = await fetch(`/api/proxy/me/startups/${item.id}`, { method: "DELETE" });
            if (!response.ok) {
                setError("O'chirib bo'lmadi. Qayta urinib ko'ring.");
                return;
            }
            if (open === item.id) setOpen(null);
            router.refresh();
        } finally {
            setRemoving(null);
        }
    }

    return (
        <div className="space-y-4">
            {/* Nechta joy qolgani */}
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-raised px-5 py-4">
                <div className="min-w-0 flex-1">
                    <p className="text-[14.5px] font-semibold tabular-nums">
                        {startups.length} / {limit} ta startap
                    </p>
                    <div className="mt-2 flex gap-1.5">
                        {Array.from({ length: limit }, (_, index) => (
                            <motion.span
                                key={index}
                                initial={false}
                                animate={{ opacity: index < startups.length ? 1 : 0.35 }}
                                className={cn(
                                    "h-1.5 w-10 rounded-full",
                                    index < startups.length ? "bg-accent" : "bg-line",
                                )}
                            />
                        ))}
                    </div>
                </div>

                {canAdd && open !== "new" && (
                    <motion.button
                        type="button"
                        onClick={() => setOpen("new")}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-semibold text-on-invert transition-opacity hover:opacity-90"
                    >
                        <Icon name="plus" size={15} strokeWidth={2.4} />
                        Startap qo&apos;shish
                    </motion.button>
                )}
            </div>

            {error && (
                <p className="rounded-xl bg-warn-soft px-4 py-3 text-[13.5px] text-warn-text">{error}</p>
            )}

            {/* Mavjud startaplar */}
            <AnimatePresence initial={false}>
                {startups.map((item) => {
                    const expanded = open === item.id;
                    return (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="overflow-hidden rounded-2xl border border-line bg-raised"
                        >
                            <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                                <span className="tone-violet grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-tone-line bg-tone-soft text-tone-text">
                                    {item.logo_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={item.logo_url} alt="" className="size-full object-cover" />
                                    ) : (
                                        <Icon name="rocket" size={22} />
                                    )}
                                </span>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[15.5px] font-semibold tracking-tight">
                                        {item.name}
                                    </p>
                                    <p className="mt-0.5 truncate text-[12.5px] text-muted">
                                        {item.sphere_display} · {item.stage_display}
                                    </p>
                                </div>

                                <span
                                    className={cn(
                                        `tone-${STATUS_TONE[item.status] ?? "amber"}`,
                                        "rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text",
                                    )}
                                >
                                    {item.status_display}
                                </span>

                                <div className="flex gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(expanded ? null : item.id)}
                                        className={cn(
                                            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-medium transition-colors",
                                            expanded
                                                ? "border-accent text-accent"
                                                : "border-line hover:border-accent hover:text-accent",
                                        )}
                                    >
                                        {expanded ? (
                                            <Icon name="close" size={14} />
                                        ) : (
                                            <Pencil className="size-3.5" strokeWidth={2} />
                                        )}
                                        {expanded ? "Yopish" : "Tahrirlash"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(item)}
                                        disabled={removing === item.id}
                                        aria-label="O'chirish"
                                        title="O'chirish"
                                        className="grid size-9 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-warn hover:text-warn-text disabled:opacity-50"
                                    >
                                        {removing === item.id ? (
                                            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                        ) : (
                                            <Icon name="trash" size={15} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence initial={false}>
                                {expanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.35, ease: EASE }}
                                        className="overflow-hidden border-t border-line"
                                    >
                                        <div className="bg-page p-4 sm:p-5">
                                            {item.status === "rejected" && (
                                                <StatusBanner status="rejected" note={item.admin_note} />
                                            )}
                                            <StartupForm
                                                key={item.id}
                                                spheres={spheres}
                                                stages={stages}
                                                initial={item}
                                                action={`/api/proxy/me/startups/${item.id}`}
                                                onSaved={() => setOpen(null)}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Yangi startap */}
            <AnimatePresence>
                {open === "new" && canAdd && (
                    <motion.div
                        key="new"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.35, ease: EASE }}
                    >
                        <div className="mb-3 flex items-center justify-between gap-3 pt-2">
                            <h2 className="text-[16px] font-semibold tracking-tight">
                                {startups.length ? "Yangi startap" : "Birinchi startapingiz"}
                            </h2>
                            {startups.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setOpen(null)}
                                    className="text-[13px] text-muted transition-colors hover:text-text"
                                >
                                    Bekor qilish
                                </button>
                            )}
                        </div>
                        <StartupForm
                            spheres={spheres}
                            stages={stages}
                            action="/api/proxy/me/startups"
                            submitLabel="Startapni qo'shish"
                            onSaved={() => setOpen(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {!canAdd && (
                <p className="text-center text-[13px] text-muted">
                    {limit} ta startap limitiga yetdingiz. Yangisini qo&apos;shish uchun birini
                    o&apos;chiring.
                </p>
            )}
        </div>
    );
}
