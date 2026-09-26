"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { EmptyState, Flash, PanelHeader } from "@/components/panel/ui";
import { cn } from "@/lib/cn";
import { formatShortDate, formatTime } from "@/lib/format";

/**
 * Server xatolari — foydalanuvchi 500 xatoga duch kelgan har bir holat.
 *
 * Bir xil xato bitta qator bo'lib turadi, necha marta takrorlangani
 * yoziladi. Dasturchiga yuborish uchun traceback'ni nusxalash mumkin.
 * «Hal qilindi» — ro'yxatdan olinadi; yana chiqsa, yangidan paydo bo'ladi.
 */

export type ServerErrorRow = {
    id: number;
    title: string;
    location: string;
    method: string;
    path: string;
    traceback: string;
    count: number;
    first_seen: string;
    last_seen: string;
};

const when = (value: string) => `${formatShortDate(value)} ${formatTime(value)}`;

export function ErrorsPanel({
    errors,
    total,
    lastDay,
}: {
    errors: ServerErrorRow[];
    total: number;
    lastDay: number;
}) {
    const router = useRouter();
    const [openId, setOpenId] = useState<number | null>(null);
    const [busyId, setBusyId] = useState<number | "all" | null>(null);
    const [flash, setFlash] = useState<string | null>(null);

    async function resolve(row: ServerErrorRow) {
        setBusyId(row.id);
        try {
            const response = await fetch(`/api/proxy/panel/xatolar/${row.id}`, { method: "DELETE" });
            setFlash(response.ok ? "Hal qilindi deb belgilandi." : "Bajarib bo'lmadi.");
            if (response.ok) router.refresh();
        } finally {
            setBusyId(null);
        }
    }

    async function clearAll() {
        if (!confirm(`Hamma ${total} ta xato ro'yxatdan olinsinmi?`)) return;
        setBusyId("all");
        try {
            const response = await fetch("/api/proxy/panel/xatolar", { method: "DELETE" });
            setFlash(response.ok ? "Ro'yxat tozalandi." : "Bajarib bo'lmadi.");
            if (response.ok) router.refresh();
        } finally {
            setBusyId(null);
        }
    }

    async function copy(row: ServerErrorRow) {
        const text = `${row.title}\n${row.method} ${row.path}\n${row.count} marta, oxirgi: ${when(row.last_seen)}\n\n${row.traceback}`;
        try {
            await navigator.clipboard.writeText(text);
            setFlash("Nusxalandi — dasturchiga yuborishingiz mumkin.");
        } catch {
            setFlash("Nusxalab bo'lmadi.");
        }
    }

    return (
        <>
            <PanelHeader
                title="Server xatolari"
                description="Saytda foydalanuvchi xatoga duch kelgan holatlar. Yangi xato chiqsa, bot adminlarga Telegram'da xabar beradi."
                action={
                    errors.length ? (
                        <button
                            type="button"
                            onClick={clearAll}
                            disabled={busyId !== null}
                            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[13px] text-muted transition-colors hover:border-warn-text hover:bg-warn-soft hover:text-warn-text disabled:opacity-40"
                        >
                            <Icon name="trash" size={14} />
                            Hammasini tozalash
                        </button>
                    ) : undefined
                }
            />

            <Flash text={flash} onDone={() => setFlash(null)} />

            <div className="mt-6 flex flex-wrap gap-2.5 text-[13px]">
                <span
                    className={cn(
                        lastDay ? "tone-rose" : "tone-emerald",
                        "inline-flex items-center gap-2 rounded-full border border-tone-line bg-tone-soft px-3.5 py-1.5 font-medium text-tone-text",
                    )}
                >
                    <Icon name={lastDay ? "alert" : "check"} size={14} />
                    So&apos;nggi 24 soatda: {lastDay}
                </span>
                <span className="inline-flex items-center rounded-full border border-line px-3.5 py-1.5 text-muted">
                    Jami turli xato: {total}
                </span>
            </div>

            {errors.length ? (
                <ul className="mt-5 space-y-2.5">
                    {errors.map((row) => {
                        const open = openId === row.id;
                        return (
                            <li
                                key={row.id}
                                className={cn(
                                    "rounded-2xl border border-line bg-raised p-4",
                                    busyId === row.id && "opacity-60",
                                )}
                            >
                                <div className="flex flex-wrap items-start gap-3">
                                    <span className="tone-rose grid size-9 shrink-0 place-items-center rounded-xl bg-tone-soft text-tone-text">
                                        <Icon name="alert" size={16} />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="break-words font-mono text-[13px] font-medium text-text">
                                            {row.title}
                                        </p>
                                        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-faint">
                                            {row.location && <span>{row.location}</span>}
                                            {row.path && (
                                                <span className="break-all">
                                                    {row.method} {row.path}
                                                </span>
                                            )}
                                        </p>
                                        <p className="mt-1 flex flex-wrap gap-x-3 text-[12px] text-muted">
                                            <span className="font-medium text-warn-text">{row.count} marta</span>
                                            <span>oxirgi: {when(row.last_seen)}</span>
                                            <span>birinchi: {when(row.first_seen)}</span>
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setOpenId(open ? null : row.id)}
                                            aria-expanded={open}
                                            className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-muted transition-colors hover:text-text"
                                        >
                                            {open ? "Yopish" : "Batafsil"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => copy(row)}
                                            title="Traceback'ni nusxalash"
                                            className="grid size-8 place-items-center rounded-full border border-line text-muted transition-colors hover:text-text"
                                        >
                                            <Icon name="clipboard" size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => resolve(row)}
                                            disabled={busyId !== null}
                                            className="tone-emerald inline-flex items-center gap-1.5 rounded-full border border-tone-line bg-tone-soft px-3 py-1.5 text-[12.5px] font-medium text-tone-text transition-opacity hover:opacity-90 disabled:opacity-40"
                                        >
                                            <Icon name="check" size={13} />
                                            Hal qilindi
                                        </button>
                                    </div>
                                </div>

                                {open && (
                                    <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-surface p-3.5 font-mono text-[11.5px] leading-relaxed text-muted">
                                        {row.traceback}
                                    </pre>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="mt-5">
                    <EmptyState text="Xato yo'q — hammasi joyida ✓" />
                </div>
            )}
        </>
    );
}
