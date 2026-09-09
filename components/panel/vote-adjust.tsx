"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { INPUT, refreshPublic } from "@/components/panel/ui";

/**
 * Tashabbus ovozini qo'lda sozlash.
 *
 * Ovozlar jadvaliga tegilmaydi — faqat hisoblagich o'zgaradi, shuning uchun
 * kim ovoz berganini ko'rsatuvchi ma'lumot buzilmaydi.
 */
export function VoteAdjust({ id, votes }: { id: number; votes: number }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [count, setCount] = useState(votes);

    async function send(body: Record<string, number>) {
        setBusy(true);
        try {
            const response = await fetch(`/api/proxy/panel/initiatives/${id}/votes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (response.ok) {
                const data = (await response.json()) as { votes: number };
                setCount(data.votes);
                await refreshPublic("initiatives");
                router.refresh();
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                title="Ovozni sozlash"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] text-muted transition-colors hover:bg-surface hover:text-text"
            >
                <Icon name="vote" size={14} />
                <span className="font-semibold tabular-nums">{count}</span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-line bg-raised p-3 shadow-lg"
                    >
                        <p className="text-[12px] text-muted">Ovozni qo&apos;lda sozlash</p>

                        <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                            {[-100, -10, 10, 100].map((delta) => (
                                <button
                                    key={delta}
                                    type="button"
                                    disabled={busy}
                                    onClick={() => send({ delta })}
                                    className="rounded-lg border border-line py-1.5 text-[12px] tabular-nums transition-colors hover:bg-surface disabled:opacity-50"
                                >
                                    {delta > 0 ? `+${delta}` : delta}
                                </button>
                            ))}
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                const value = new FormData(event.currentTarget).get("exact");
                                const exact = Number(value);
                                if (Number.isFinite(exact) && exact >= 0) send({ exact });
                            }}
                            className="mt-2.5 flex gap-1.5"
                        >
                            <input
                                name="exact"
                                type="number"
                                min={0}
                                placeholder="Aniq son"
                                className={`${INPUT} py-1.5 text-[12.5px]`}
                            />
                            <button
                                type="submit"
                                disabled={busy}
                                className="shrink-0 rounded-lg bg-invert px-3 text-[12.5px] font-medium text-on-invert disabled:opacity-50"
                            >
                                Qo&apos;y
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
