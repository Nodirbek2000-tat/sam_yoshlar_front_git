"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Dialog } from "@/components/dialog";
import { Icon } from "@/components/icon";
import { formatNumber } from "@/lib/format";
import type { PollOption, PollVoteResult } from "@/lib/types";

import { Avatar, placeOf, qualifies } from "./poll-ui";

/** G'alaba «uchqunlari» — ovoz qabul qilinganda bir marta sochiladi */
const SPARKS = Array.from({ length: 14 }, (_, index) => {
    const angle = (index / 14) * Math.PI * 2;
    return {
        x: Math.cos(angle) * (70 + (index % 3) * 18),
        y: Math.sin(angle) * (70 + (index % 3) * 18),
        tone: ["tone-amber", "tone-emerald", "tone-blue", "tone-rose"][index % 4],
    };
});

/**
 * Ovozni tasdiqlash oynasi: «Ha, ovoz beraman» -> qabul qilindi + ulashish.
 * Faqat foydalanuvchi nomzodni tanlaganda yuklanadi.
 */
export default function VoteDialog({
    slug,
    option,
    reveal,
    min,
    title,
    path,
    onClose,
    onVoted,
    onConflict,
}: {
    slug: string;
    option: PollOption;
    reveal: boolean;
    /** 1-2-3 o'rin uchun eng kam ovoz */
    min: number;
    title: string;
    path: string;
    onClose: () => void;
    onVoted: (result: PollVoteResult) => void;
    onConflict: () => void;
}) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PollVoteResult | null>(null);
    // Qayta urinishning foydasi yo'q xato (allaqachon ovoz bergan, so'rovnoma yopilgan…)
    const [final, setFinal] = useState(false);

    async function vote() {
        if (busy || final) return;
        setBusy(true);
        setError(null);

        try {
            const response = await fetch(`/api/proxy/polls/${slug}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ option: option.id }),
            });
            const data = (await response.json().catch(() => null)) as
                (PollVoteResult & { detail?: string }) | null;

            if (response.status === 401) {
                router.push(`/kirish?next=${encodeURIComponent(path)}`);
                return;
            }
            if (!response.ok || !data) {
                setError(data?.detail ?? "Ovoz berib bo'lmadi. Qayta urinib ko'ring.");
                // 4xx — qayta bosish foyda bermaydi (boshqa oynada ovoz bergan, so'rovnoma
                // yopilgan, nomzod olib tashlangan). Sahifa ham yangi holatni ko'rsatsin.
                if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    setFinal(true);
                    onConflict();
                }
                return;
            }

            setResult(data);
            onVoted(data);
        } catch {
            setError("Tarmoqda xatolik. Internetni tekshirib, qayta urinib ko'ring.");
        } finally {
            setBusy(false);
        }
    }

    function share() {
        const url = `${window.location.origin}${path}`;
        const text = `${title} — men ${option.name}ga ovoz berdim. Siz ham qo'llab-quvvatlang!`;
        window.open(
            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
            "_blank",
            "noopener,noreferrer",
        );
    }

    const fresh = result?.options.find((item) => item.id === option.id);
    const where = placeOf(option);

    return (
        <Dialog
            open
            onClose={onClose}
            label="Ovozni tasdiqlash"
            locked={busy}
            className="tone-amber text-center"
        >
            {result ? (
                <div className="pb-1 pt-2">
                    <div className="relative mx-auto grid size-24 place-items-center">
                        {SPARKS.map((spark, index) => (
                            <motion.span
                                key={index}
                                className={`${spark.tone} absolute size-2 rounded-full bg-tone`}
                                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                                animate={{ x: spark.x, y: spark.y, opacity: 0, scale: 1 }}
                                transition={{
                                    duration: 0.9,
                                    ease: [0.22, 1, 0.36, 1],
                                    delay: 0.1,
                                }}
                            />
                        ))}
                        <motion.span
                            className="tone-emerald grid size-20 place-items-center rounded-full bg-tone text-page shadow-[0_12px_30px_-10px_var(--tone)]"
                            initial={{ scale: 0, rotate: -30 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 420, damping: 18 }}
                        >
                            <Icon name="check" size={36} strokeWidth={2.4} />
                        </motion.span>
                    </div>

                    <h2 className="mt-5 text-[1.35rem] font-semibold tracking-tight">
                        Ovozingiz qabul qilindi!
                    </h2>
                    <p className="mt-2 text-[14px] text-muted">
                        Siz <b className="text-text">{option.name}</b>ni
                        qo&apos;llab-quvvatladingiz.
                        {!reveal || !fresh
                            ? " Natijalar keyinroq e'lon qilinadi."
                            : qualifies(fresh, min) && fresh.rank
                              ? ` Hozir u ${fresh.rank}-o'rinda — ${formatNumber(fresh.votes ?? 0)} ta ovoz.`
                              : ` Hozir unda ${formatNumber(fresh.votes ?? 0)} ta ovoz.`}
                    </p>

                    <div className="mt-6 grid gap-2">
                        <button
                            type="button"
                            // Natija chiqqanda fokus shu yerga o'tadi (tasdiq tugmasi yo'qoladi)
                            autoFocus
                            onClick={share}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-invert px-5 py-3 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90"
                        >
                            <Icon name="telegram" size={16} />
                            Do&apos;stlarga ulashish
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full px-5 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            ) : (
                <div className="pt-2">
                    <Avatar
                        option={option}
                        size={96}
                        className="mx-auto rounded-3xl shadow-[0_18px_40px_-20px_var(--tone)]"
                    />
                    <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.12em] text-tone-text">
                        Ovozingizni tasdiqlang
                    </p>
                    <h2 className="mt-1.5 text-[1.35rem] font-semibold leading-snug tracking-tight">
                        {option.name}
                    </h2>
                    {where && <p className="mt-1 text-[13.5px] text-muted">{where}</p>}
                    {option.note && <p className="mt-2 text-[13px] text-faint">{option.note}</p>}

                    <p className="mt-5 rounded-xl bg-surface px-4 py-3 text-[12.5px] leading-relaxed text-muted">
                        Har kim bitta so&apos;rovnomada faqat bir marta ovoz beradi — keyin
                        o&apos;zgartirib bo&apos;lmaydi.
                    </p>

                    {error && (
                        <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-left text-[13px] text-warn-text">
                            <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                            {error}
                        </p>
                    )}

                    <div className="mt-6 grid gap-2">
                        {!final && (
                            <button
                                type="button"
                                data-autofocus
                                onClick={vote}
                                disabled={busy}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-invert px-5 py-3 text-[14px] font-medium text-on-invert transition-opacity hover:opacity-90 disabled:opacity-60"
                            >
                                <Icon name="vote" size={16} />
                                {busy ? "Yuborilmoqda…" : "Ha, ovoz beraman"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                            className="rounded-full px-5 py-2.5 text-[13.5px] text-muted transition-colors hover:text-text disabled:opacity-50"
                        >
                            {final ? "Yopish" : "Bekor qilish"}
                        </button>
                    </div>
                </div>
            )}
        </Dialog>
    );
}
