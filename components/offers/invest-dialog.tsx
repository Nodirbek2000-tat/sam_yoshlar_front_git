"use client";

import { HandCoins } from "lucide-react";
import { motion } from "motion/react";
import { useState, type FormEvent } from "react";

import { Dialog } from "@/components/dialog";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import type { OfferState } from "@/lib/types";

/**
 * «Investitsiya kiritaman» oynasi: investor ismi va aloqa ma'lumotini
 * qoldiradi. Yuborilgach startap egasiga saytda va botda xabar boradi.
 */

export type InvestPrefill = { full_name: string; phone: string; telegram: string };

type Errors = Partial<Record<"full_name" | "phone" | "telegram" | "detail", string>>;

const INPUT =
    "w-full rounded-xl border border-line bg-page px-3.5 py-3 text-[15px] outline-none transition-colors placeholder:text-faint focus:border-tone";

export default function InvestDialog({
    open,
    onClose,
    startupId,
    startupName,
    prefill,
    onSent,
}: {
    open: boolean;
    onClose: () => void;
    startupId: number;
    startupName: string;
    prefill: InvestPrefill;
    onSent: (offer: OfferState) => void;
}) {
    const [form, setForm] = useState({
        full_name: prefill.full_name,
        phone: prefill.phone,
        telegram: prefill.telegram ? `@${prefill.telegram}` : "",
    });
    const [busy, setBusy] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [sent, setSent] = useState<OfferState | null>(null);

    const change = (field: keyof typeof form) => (event: { target: { value: string } }) => {
        setForm((previous) => ({ ...previous, [field]: event.target.value }));
        setErrors((previous) => ({ ...previous, [field]: undefined, detail: undefined }));
    };

    async function submit(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setErrors({});

        try {
            const response = await fetch(`/api/proxy/startups/${startupId}/invest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await response.json().catch(() => null);

            // 409 — oldin yuborilgan: bu ham muvaffaqiyat, holatni ko'rsatamiz
            if ((response.ok || response.status === 409) && data?.offer) {
                setSent(data.offer);
                return;
            }
            if (response.status === 401) {
                setErrors({ detail: "Avval tizimga kiring." });
                return;
            }

            const first = (value: unknown) => (Array.isArray(value) ? String(value[0]) : undefined);
            setErrors({
                full_name: first(data?.full_name),
                phone: first(data?.phone),
                telegram: first(data?.telegram),
                detail:
                    data?.detail ??
                    (data?.full_name || data?.phone || data?.telegram
                        ? undefined
                        : "Yuborib bo'lmadi. Qayta urinib ko'ring."),
            });
        } catch {
            setErrors({ detail: "Internet aloqasini tekshiring." });
        } finally {
            setBusy(false);
        }
    }

    function close() {
        // Yuborilgan bo'lsa — sahifadagi tugma «yuborildi» holatiga o'tadi
        if (sent) onSent(sent);
        onClose();
    }

    return (
        <Dialog
            open={open}
            onClose={close}
            locked={busy}
            label="Investitsiya kiritish"
            className="tone-emerald"
        >
            {sent ? (
                <div className="py-3 text-center">
                    <motion.span
                        className="mx-auto grid size-18 place-items-center rounded-full bg-tone-soft text-tone-text"
                        initial={{ scale: 0.4, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 14 }}
                    >
                        <Icon name="check" size={34} strokeWidth={2.2} />
                    </motion.span>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <h2 className="mt-5 text-xl font-semibold tracking-tight">
                            Ma&apos;lumotlaringiz yuborildi
                        </h2>
                        <p className="mx-auto mt-2 max-w-xs text-[14.5px] leading-relaxed text-muted">
                            «{startupName}» asoschisi so&apos;rovingizni oldi va yaqin orada siz bilan
                            bog&apos;lanadi.
                        </p>

                        <button
                            type="button"
                            onClick={close}
                            className="mt-6 w-full rounded-xl bg-invert py-3 text-[14.5px] font-semibold text-on-invert transition-opacity hover:opacity-90"
                        >
                            Yaxshi
                        </button>
                    </motion.div>
                </div>
            ) : (
                <form onSubmit={submit} noValidate>
                    <span className="grid size-12 place-items-center rounded-2xl bg-tone-soft text-tone-text">
                        <HandCoins className="size-6" strokeWidth={1.7} />
                    </span>

                    <h2 className="mt-4 pr-8 text-xl font-semibold tracking-tight">
                        Investitsiya kiritish
                    </h2>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-muted">
                        Aloqa ma&apos;lumotingizni qoldiring — «{startupName}» asoschisi siz bilan
                        o&apos;zi bog&apos;lanadi.
                    </p>

                    <div className="mt-5 space-y-3.5">
                        <Row label="Ism va familiya" error={errors.full_name}>
                            <input
                                value={form.full_name}
                                onChange={change("full_name")}
                                autoComplete="name"
                                placeholder="Ali Valiyev"
                                required
                                className={cn(INPUT, errors.full_name && "border-warn-text")}
                            />
                        </Row>
                        <Row label="Telefon raqami" error={errors.phone}>
                            <input
                                value={form.phone}
                                onChange={change("phone")}
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="+998 90 123 45 67"
                                required
                                className={cn(INPUT, errors.phone && "border-warn-text")}
                            />
                        </Row>
                        <Row label="Telegram" hint="ixtiyoriy" error={errors.telegram}>
                            <input
                                value={form.telegram}
                                onChange={change("telegram")}
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                placeholder="@username"
                                className={cn(INPUT, errors.telegram && "border-warn-text")}
                            />
                        </Row>
                    </div>

                    {errors.detail && (
                        <p className="tone-rose mt-4 rounded-xl bg-tone-soft px-3.5 py-2.5 text-[13px] text-tone-text">
                            {errors.detail}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={busy}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-invert py-3.5 text-[14.5px] font-semibold text-on-invert transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {busy ? (
                            "Yuborilmoqda…"
                        ) : (
                            <>
                                <Icon name="send" size={15} />
                                Yuborish
                            </>
                        )}
                    </button>

                    <p className="mt-3 text-center text-[12px] leading-relaxed text-faint">
                        Ma&apos;lumotingizni faqat shu startap asoschisi va sayt ma&apos;muriyati ko&apos;radi.
                    </p>
                </form>
            )}
        </Dialog>
    );
}

function Row({
    label,
    hint,
    error,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 flex items-baseline justify-between text-[12.5px] text-muted">
                {label}
                {hint && <span className="text-faint">{hint}</span>}
            </span>
            {children}
            {error && <span className="mt-1 block text-[12px] text-warn-text">{error}</span>}
        </label>
    );
}
