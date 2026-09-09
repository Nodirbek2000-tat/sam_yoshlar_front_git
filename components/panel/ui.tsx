"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Panelning umumiy qismlari.
 *
 * Har bir bo'lim sahifasi shu bloklardan yig'iladi — shunda sarlavha,
 * tugmalar va xabarlar hamma joyda bir xil ko'rinadi.
 */

export function PanelHeader({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-1.5 text-[14px] text-muted">{description}</p>
            </div>
            {action}
        </div>
    );
}

/** Yashil tasdiq xabari — o'zi bir necha soniyada yo'qoladi. */
export function Flash({ text, onDone }: { text: string | null; onDone: () => void }) {
    return (
        <AnimatePresence>
            {text && (
                <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onAnimationComplete={() => setTimeout(onDone, 2600)}
                    className="tone-emerald mt-5 inline-flex items-center gap-2 rounded-full bg-tone-soft px-4 py-2 text-[13px] text-tone-text"
                >
                    <Icon name="check" size={14} />
                    {text}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

export function IconAction({
    icon,
    title,
    danger,
    disabled,
    onClick,
}: {
    icon: IconName;
    title: string;
    danger?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            aria-label={title}
            className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg border border-line transition-colors disabled:opacity-40",
                danger
                    ? "text-muted hover:bg-warn-soft hover:text-warn-text"
                    : "text-muted hover:bg-surface hover:text-text",
            )}
        >
            <Icon name={icon} size={15} />
        </button>
    );
}

/** Moderatsiya holati: kutilmoqda / tasdiqlangan / rad etilgan. */
export function StatusPill({ status }: { status: string | null }) {
    if (!status) return null;

    const map: Record<string, { label: string; tone: string }> = {
        pending: { label: "Kutilmoqda", tone: "tone-amber" },
        approved: { label: "Tasdiqlangan", tone: "tone-emerald" },
        rejected: { label: "Rad etilgan", tone: "tone-rose" },
    };
    const info = map[status];
    if (!info) return null;

    return (
        <span
            className={cn(
                info.tone,
                "rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text",
            )}
        >
            {info.label}
        </span>
    );
}

export function EmptyState({ text }: { text: string }) {
    return (
        <p className="mt-3 rounded-2xl border border-dashed border-line py-14 text-center text-[14px] text-muted">
            {text}
        </p>
    );
}

export const INPUT =
    "w-full rounded-xl border border-line bg-page px-3.5 py-2.5 text-[14px] outline-none transition-colors placeholder:text-faint focus:border-accent";

export function Field({
    label,
    className,
    children,
}: {
    label: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <label className={cn("block", className)}>
            <span className="mb-1.5 block text-[12.5px] text-muted">{label}</span>
            {children}
        </label>
    );
}

/**
 * Ha/yo'q kalitchasi. Forma bilan yuborilishi uchun yashirin maydon ham bor —
 * oddiy checkbox belgilanmaganda umuman yuborilmaydi, bu esa tahrirlashda
 * "o'chirish" niyatini yo'qotadi.
 */
export function Toggle({
    name,
    label,
    defaultChecked,
}: {
    name: string;
    label: string;
    defaultChecked: boolean;
}) {
    const [on, setOn] = useState(defaultChecked);

    return (
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-[13.5px]">
            <input type="hidden" name={name} value={on ? "true" : "false"} />
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={label}
                onClick={() => setOn((value) => !value)}
                className={cn(
                    "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                    on ? "bg-accent" : "bg-line",
                )}
            >
                <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                    className={cn(
                        "absolute top-0.5 size-4 rounded-full bg-page shadow-sm",
                        on ? "right-0.5" : "left-0.5",
                    )}
                />
            </button>
            {label}
        </label>
    );
}

/** Panel ro'yxatlari ustidagi qidiruv. */
export function SearchBox({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <div className="relative max-w-xs flex-1">
            <Icon
                name="search"
                size={15}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
            />
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={`${INPUT} pl-10`}
            />
        </div>
    );
}

/** Panelda o'zgarish bo'lgach ochiq sahifalar keshini tozalash. */
export async function refreshPublic(tag: string) {
    await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag }),
    }).catch(() => null);
}
