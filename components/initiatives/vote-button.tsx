"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { VoteResult } from "@/lib/types";

/**
 * Ovoz berish tugmasi.
 *
 * Mehmon bosганda kirish sahifasiga yuboriladi — server ham buni tekshiradi,
 * bu yerdagi tekshiruv faqat foydalanuvchi qulayligi uchun.
 */
export function VoteButton({
    initiativeId,
    votes,
    voted,
    canVote,
    color,
    size = "md",
}: {
    initiativeId: number;
    votes: number;
    voted: boolean;
    canVote: boolean;
    color?: string;
    size?: "sm" | "md";
}) {
    const router = useRouter();
    const [count, setCount] = useState(votes);
    const [done, setDone] = useState(voted);
    const [busy, setBusy] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    async function vote() {
        if (!canVote) {
            router.push(`/kirish?next=/tashabbuslar/${initiativeId}`);
            return;
        }
        if (done || busy) return;

        setBusy(true);
        // Darhol javob beramiz — tarmoq javobini kutib turmaymiz
        setCount((value) => value + 1);
        setDone(true);

        try {
            const response = await fetch(`/api/proxy/initiatives/${initiativeId}/vote`, {
                method: "POST",
            });
            const data = (await response.json()) as VoteResult & { detail?: string };

            if (!response.ok) {
                // Orqaga qaytaramiz — ovoz o'tmadi
                setCount(votes);
                setDone(voted);
                setToast(data.detail ?? "Ovoz berib bo'lmadi.");
                return;
            }

            setCount(data.votes);
            setToast(data.message);
            router.refresh();
        } catch {
            setCount(votes);
            setDone(voted);
            setToast("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
            setTimeout(() => setToast(null), 3200);
        }
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={vote}
                disabled={busy}
                title={done ? "Siz ovoz bergansiz" : "Ovoz berish"}
                className={cn(
                    "group inline-flex items-center gap-2 rounded-full border transition-all duration-200",
                    size === "sm" ? "px-3 py-1.5 text-[12.5px]" : "px-4 py-2 text-[13.5px]",
                    done
                        ? "border-transparent bg-accent-soft text-accent-text"
                        : "border-line text-muted hover:border-current hover:text-text",
                )}
                style={done && color ? { color } : undefined}
            >
                <Icon
                    name="vote"
                    size={size === "sm" ? 13 : 15}
                    className={cn("transition-transform duration-200", !done && "group-hover:-translate-y-0.5")}
                />
                <motion.span
                    key={count}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="font-semibold tabular-nums"
                >
                    {count}
                </motion.span>
            </button>

            <AnimatePresence>
                {toast && (
                    <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-1/2 top-full z-20 mt-2 w-max max-w-[200px] -translate-x-1/2 rounded-lg bg-invert px-3 py-1.5 text-[12px] leading-snug text-on-invert shadow-lg"
                    >
                        {toast}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
