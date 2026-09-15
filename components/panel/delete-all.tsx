"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/icon";
import { refreshPublic } from "@/components/panel/ui";

/**
 * «Hammasini o'chirish» — bo'limdagi barcha yozuvni bir bosishda o'chiradi.
 *
 * Qaytarib bo'lmaydigan ish: bosilganda bir marta so'raydi va nechta
 * yozuv ketishini aytadi. Oyna `body` ga ko'chiriladi — panel qobig'idagi
 * `backdrop-blur` ichida `fixed` element qisilib qolmasin.
 */
/** Bo'lim → nima o'chishi (tugma o'zi biladi, har bir panel alohida aytmasin). */
const LABELS: Record<string, { noun: string; extra?: string }> = {
    initiatives: { noun: "tashabbus", extra: "ovozlari va izohlari bilan birga" },
    problems: { noun: "muammo", extra: "takliflari bilan birga" },
    peers: { noun: "tengdosh" },
    startups: { noun: "startap" },
    news: { noun: "yangilik" },
    events: { noun: "tadbir", extra: "yozilishlari bilan birga" },
    announcements: { noun: "e'lon" },
};

export function DeleteAllButton({
    resource,
    count,
    onDeleted,
}: {
    /** API bo'limi: `initiatives`, `news`, ... */
    resource: string;
    /** Ro'yxatda ko'rinib turgan soni (panel 60 tagacha ko'rsatadi) */
    count: number;
    onDeleted?: (message: string) => void;
}) {
    const { noun, extra } = LABELS[resource] ?? { noun: "yozuv" };
    const router = useRouter();
    // Portal faqat birinchi bosishdan keyin quriladi — server HTML bilan to'qnashmasin
    const [armed, setArmed] = useState(false);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open || busy) return;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, busy]);

    const amount = count >= 60 ? "60 dan ortiq" : String(count);

    async function run() {
        setBusy(true);
        setError(null);
        try {
            const response = await fetch(`/api/proxy/panel/${resource}/hammasi`, { method: "DELETE" });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                setError(data?.detail ?? "O'chirib bo'lmadi. Qayta urinib ko'ring.");
                return;
            }

            await refreshPublic(resource);
            setOpen(false);
            onDeleted?.(`${data?.deleted ?? 0} ta ${noun} o'chirildi.`);
            router.refresh();
        } catch {
            setError("Tarmoqda xatolik. Qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <button
                type="button"
                disabled={count === 0}
                onClick={() => {
                    setArmed(true);
                    setOpen(true);
                    setError(null);
                }}
                className="tone-rose inline-flex items-center gap-2 rounded-xl border border-tone-line px-3.5 py-2 text-[13px] font-medium text-tone-text transition-colors hover:bg-tone-soft disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Icon name="trash" size={15} />
                Hammasini o&apos;chirish
            </button>

            {armed &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                key="delete-all"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => !busy && setOpen(false)}
                                className="fixed inset-0 z-[90] grid place-items-center bg-black/50 p-5 backdrop-blur-sm"
                            >
                                <motion.div
                                    role="alertdialog"
                                    aria-modal="true"
                                    aria-label={`Hamma ${noun} o'chirilsinmi?`}
                                    initial={{ opacity: 0, y: 24, scale: 0.94 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 16, scale: 0.96 }}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    onClick={(event) => event.stopPropagation()}
                                    className="tone-rose w-full max-w-md rounded-3xl border border-line bg-page p-7 text-center shadow-2xl"
                                >
                                    <motion.span
                                        className="mx-auto grid size-16 place-items-center rounded-2xl border border-tone-line bg-tone-soft text-tone-text"
                                        initial={{ scale: 0.6, rotate: -12 }}
                                        animate={{ scale: 1, rotate: [0, -8, 8, -4, 0] }}
                                        transition={{ duration: 0.55 }}
                                    >
                                        <Icon name="trash" size={26} />
                                    </motion.span>

                                    <h2 className="mt-5 text-xl font-semibold tracking-tight">
                                        Hamma {noun} o&apos;chirilsinmi?
                                    </h2>
                                    <p className="mt-2 text-[14px] leading-relaxed text-muted">
                                        <span className="font-semibold text-text">{amount} ta {noun}</span>
                                        {extra ? ` ${extra}` : ""} butunlay o&apos;chadi. Buni qaytarib
                                        bo&apos;lmaydi.
                                    </p>

                                    {error && (
                                        <p className="mt-4 rounded-xl bg-warn-soft px-4 py-2.5 text-[13px] text-warn-text">
                                            {error}
                                        </p>
                                    )}

                                    <div className="mt-6 grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setOpen(false)}
                                            disabled={busy}
                                            className="rounded-xl border border-line py-3 text-[14px] font-medium transition-colors hover:bg-surface disabled:opacity-50"
                                        >
                                            Bekor qilish
                                        </button>
                                        <motion.button
                                            type="button"
                                            onClick={run}
                                            disabled={busy}
                                            whileTap={{ scale: 0.97 }}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-tone py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                        >
                                            {busy && (
                                                <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            )}
                                            {busy ? "O'chirilmoqda…" : "Ha, hammasini"}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}
