"use client";

import { GraduationCap, Plane, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PeerEditor } from "@/components/cabinet/peer-editor";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { Country, PeerProfile } from "@/lib/types";

/**
 * Kabinetdagi «Ta'lim profilim» — istalgan roldagi odam uchun.
 *
 * O'zbekistonda o'qisa — bir bosishda saqlanadi. Chet elda bo'lsa —
 * tengdosh anketasi ochiladi va saqlangach profil ro'yxatda chiqadi.
 */

type Location = "" | "uz" | "abroad";

const OPTIONS: { value: Exclude<Location, "">; title: string; hint: string; tone: string; icon: LucideIcon }[] = [
    {
        value: "uz",
        title: "O'zbekistonda",
        hint: "Vatanimizdagi universitet, kollej yoki litseyda",
        tone: "emerald",
        icon: GraduationCap,
    },
    {
        value: "abroad",
        title: "Chet elda",
        hint: "Profilim «Chet eldagi tengdoshlar»da chiqsin",
        tone: "blue",
        icon: Plane,
    },
];

export function StudyProfile({
    location,
    peer,
    countries,
    defaultPhone,
}: {
    location: Location;
    peer: PeerProfile | null;
    countries: Country[];
    defaultPhone: string;
}) {
    const router = useRouter();
    const [mode, setMode] = useState<Location>(location);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function choose(value: Exclude<Location, "">) {
        if (busy) return;
        setError(null);

        // Chet el — anketa saqlanganda o'zi belgilanadi
        if (value === "abroad") {
            setMode("abroad");
            return;
        }

        setBusy(true);
        try {
            const response = await fetch("/api/auth/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ study_location: "uz" }),
            });
            if (!response.ok) {
                setError("Saqlab bo'lmadi. Qayta urinib ko'ring.");
                return;
            }
            setMode("uz");
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div>
            <div className="grid gap-3 sm:grid-cols-2">
                {OPTIONS.map((option, index) => {
                    const active = mode === option.value;
                    const Glyph = option.icon;
                    return (
                        <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => choose(option.value)}
                            disabled={busy}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ delay: index * 0.08, duration: 0.35 }}
                            className={cn(
                                `tone-${option.tone}`,
                                "group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors duration-300 disabled:cursor-wait",
                                active
                                    ? "border-tone bg-tone-soft shadow-[0_16px_40px_-26px_var(--tone)]"
                                    : "border-line bg-raised hover:border-tone-line",
                            )}
                        >
                            <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-tone-line bg-tone-soft text-tone-text transition-transform duration-300 group-hover:-rotate-6">
                                <Glyph className="size-6" strokeWidth={1.7} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-[15px] font-semibold">{option.title}</span>
                                <span className="mt-0.5 block text-[12.5px] text-muted">{option.hint}</span>
                            </span>
                            <span
                                className={cn(
                                    "grid size-5 shrink-0 place-items-center rounded-full border transition-all",
                                    active ? "border-tone bg-tone text-page" : "border-line",
                                )}
                            >
                                {active && <Icon name="check" size={12} strokeWidth={3} />}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {error && (
                <p className="mt-4 rounded-xl bg-warn-soft px-4 py-3 text-[13.5px] text-warn-text">{error}</p>
            )}

            <AnimatePresence mode="wait">
                {mode === "abroad" && (
                    <motion.div
                        key="abroad"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mt-8"
                    >
                        <PeerEditor initial={peer} countries={countries} defaultPhone={defaultPhone} />
                    </motion.div>
                )}

                {mode === "uz" && (
                    <motion.p
                        key="uz"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="tone-emerald mt-6 flex items-start gap-3 rounded-2xl border border-tone-line bg-tone-soft p-4 text-[13.5px] leading-relaxed"
                    >
                        <Icon name="check" size={16} className="mt-0.5 shrink-0 text-tone-text" />
                        Siz O&apos;zbekistonda o&apos;qiysiz. Chet elga o&apos;qishga ketsangiz —
                        «Chet elda»ni tanlab anketani to&apos;ldiring, profilingiz tengdoshlar
                        ro&apos;yxatida chiqadi.
                    </motion.p>
                )}

                {mode === "" && (
                    <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-6 text-[13.5px] text-muted"
                    >
                        Qayerda ta&apos;lim olishingizni tanlang.
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
