"use client";

import { Handshake, MessagesSquare, ThumbsDown } from "lucide-react";
import { motion } from "motion/react";
import { useState, type ComponentType } from "react";

import { Dialog } from "@/components/dialog";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { OfferOutcome } from "@/lib/types";

/**
 * Startap egasidan so'raladi: investor bilan suhbat qanday o'tdi.
 *
 * Ikki joyda ochiladi: saytga kirganda o'zi chiqadi (`allowLater` bilan)
 * va kabinetdagi «Fikr bildirish» tugmasidan.
 */

export type FeedbackTarget = {
    id: number;
    startup_name: string;
    investor_name: string;
    follow_up?: boolean;
};

const OUTCOMES: {
    value: OfferOutcome;
    label: string;
    hint: string;
    tone: string;
    icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
    {
        value: "deal",
        label: "Ha, kelishdik",
        hint: "Investitsiya bo'yicha kelishuvga erishdik",
        tone: "tone-emerald",
        icon: Handshake,
    },
    {
        value: "talking",
        label: "Muzokara davom etmoqda",
        hint: "Gaplashyapmiz, hali yakuniy qaror yo'q",
        tone: "tone-amber",
        icon: MessagesSquare,
    },
    {
        value: "no_deal",
        label: "Kelishmadik",
        hint: "Bu safar hamkorlik chiqmadi",
        tone: "tone-rose",
        icon: ThumbsDown,
    },
];

export default function FeedbackDialog({
    open,
    target,
    initial,
    allowLater = false,
    onClose,
    onDone,
}: {
    open: boolean;
    target: FeedbackTarget;
    /** Oldin yozilgan fikr — kabinetda tahrirlash uchun */
    initial?: { outcome: OfferOutcome | ""; feedback: string };
    /** «Hali gaplashmadik» tugmasi — ikki kundan keyin yana so'raladi */
    allowLater?: boolean;
    /** Javobsiz yopildi */
    onClose: () => void;
    /** Fikr saqlandi yoki keyinga surildi */
    onDone: () => void;
}) {
    const [outcome, setOutcome] = useState<OfferOutcome | "">(initial?.outcome ?? "");
    const [text, setText] = useState(initial?.feedback ?? "");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [thanks, setThanks] = useState(false);

    async function send(body: Record<string, unknown>, after: () => void) {
        setBusy(true);
        setError(null);
        try {
            const response = await fetch(`/api/proxy/me/offers/${target.id}/fikr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (response.ok) {
                after();
            } else {
                const data = await response.json().catch(() => null);
                setError(data?.detail ?? "Saqlab bo'lmadi. Qayta urinib ko'ring.");
            }
        } catch {
            setError("Internet aloqasini tekshiring.");
        } finally {
            setBusy(false);
        }
    }

    const submit = () => send({ outcome, feedback: text }, () => setThanks(true));
    const later = () => send({ later: true }, onDone);

    return (
        <Dialog
            open={open}
            onClose={thanks ? onDone : onClose}
            locked={busy}
            label="Suhbat haqida fikr"
            className="tone-emerald sm:max-w-lg"
        >
            {thanks ? (
                <div className="py-3 text-center">
                    <motion.span
                        className="inline-block text-6xl"
                        initial={{ scale: 0.3, rotate: -25 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 240, damping: 12 }}
                        aria-hidden
                    >
                        🙏
                    </motion.span>
                    <h2 className="mt-4 text-xl font-semibold tracking-tight">Rahmat!</h2>
                    <p className="mx-auto mt-2 max-w-xs text-[14.5px] leading-relaxed text-muted">
                        Fikringiz biz uchun muhim — startaplarga yanada yaxshiroq yordam berishimizga
                        xizmat qiladi.
                    </p>
                    <button
                        type="button"
                        onClick={onDone}
                        className="mt-6 w-full rounded-xl bg-invert py-3 text-[14.5px] font-semibold text-on-invert transition-opacity hover:opacity-90"
                    >
                        Yopish
                    </button>
                </div>
            ) : (
                <>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-tone-soft px-3 py-1 text-[12px] font-medium text-tone-text">
                        <Icon name="rocket" size={12} />
                        {target.startup_name}
                    </span>

                    <h2 className="mt-3.5 pr-8 text-xl font-semibold leading-snug tracking-tight">
                        {target.follow_up
                            ? "Muzokara qanday yakunlandi?"
                            : "Investor bilan suhbat qanday o'tdi?"}
                    </h2>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">
                        Startapingizga qiziqish bildirgan{" "}
                        <b className="font-semibold text-text">{target.investor_name}</b> bilan
                        gaplashdingizmi? Investitsiya olishga kelishib oldingizmi?
                    </p>

                    <div className="mt-5 grid gap-2">
                        {OUTCOMES.map((item) => {
                            const active = outcome === item.value;
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setOutcome(item.value)}
                                    aria-pressed={active}
                                    className={cn(
                                        item.tone,
                                        "flex items-center gap-3.5 rounded-2xl border px-4 py-3 text-left transition-colors",
                                        active
                                            ? "border-tone bg-tone-soft"
                                            : "border-line hover:border-tone-line hover:bg-tone-soft/50",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "grid size-10 shrink-0 place-items-center rounded-xl transition-colors",
                                            active ? "bg-page text-tone-text" : "bg-surface text-muted",
                                        )}
                                    >
                                        <item.icon className="size-5" strokeWidth={1.7} />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={cn(
                                                "block text-[14.5px] font-medium",
                                                active && "text-tone-text",
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                        <span className="block text-[12.5px] text-muted">{item.hint}</span>
                                    </span>
                                    <span
                                        className={cn(
                                            "grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
                                            active
                                                ? "border-tone bg-tone text-page"
                                                : "border-line text-transparent",
                                        )}
                                    >
                                        <Icon name="check" size={11} strokeWidth={3} />
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <label className="mt-4 block">
                        <span className="mb-1.5 flex items-baseline justify-between text-[12.5px] text-muted">
                            Suhbat haqida fikringiz
                            <span className="text-faint">ixtiyoriy</span>
                        </span>
                        <textarea
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            rows={3}
                            maxLength={2000}
                            placeholder="Masalan: uchrashdik, shartlarni muhokama qildik…"
                            className="w-full resize-none rounded-xl border border-line bg-page px-3.5 py-3 text-[14.5px] leading-relaxed outline-none transition-colors placeholder:text-faint focus:border-tone"
                        />
                    </label>

                    {error && (
                        <p className="tone-rose mt-3 rounded-xl bg-tone-soft px-3.5 py-2.5 text-[13px] text-tone-text">
                            {error}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={submit}
                        disabled={busy || !outcome}
                        className="mt-5 w-full rounded-xl bg-invert py-3.5 text-[14.5px] font-semibold text-on-invert transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        {busy ? "Saqlanmoqda…" : "Fikrni yuborish"}
                    </button>

                    {allowLater && (
                        <button
                            type="button"
                            onClick={later}
                            disabled={busy}
                            className="mt-2 w-full rounded-xl py-2.5 text-[13.5px] text-muted transition-colors hover:text-text disabled:opacity-40"
                        >
                            Hali gaplashmadik — keyinroq so&apos;rang
                        </button>
                    )}
                </>
            )}
        </Dialog>
    );
}
