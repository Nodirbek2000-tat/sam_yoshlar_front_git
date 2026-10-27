"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { ApplyLink } from "@/components/panel/polls-panel";
import { EmptyState, Flash, INPUT, refreshPublic } from "@/components/panel/ui";
import { nominationEmoji, nominationTone } from "@/components/polls/contest-ui";
import { initials } from "@/components/polls/poll-ui";
import { cn } from "@/lib/cn";
import { formatNumber, formatShortDate, formatTime } from "@/lib/format";
import type { PollApplication, PollApplicationList, PollApplicationStatus } from "@/lib/types";

const TABS: { value: PollApplicationStatus; label: string; tone: string }[] = [
    { value: "pending", label: "Yangi", tone: "tone-amber" },
    { value: "approved", label: "Tasdiqlangan", tone: "tone-emerald" },
    { value: "rejected", label: "Rad etilgan", tone: "tone-rose" },
];

/**
 * Panel: havola orqali kelgan nomzod arizalari.
 *
 * «Tasdiqlash» — nomzod darhol saytda chiqadi va unga ovoz berish mumkin
 * bo'ladi. Telefon raqami faqat shu yerda ko'rinadi.
 */
export function PollApplicationsView({ initial }: { initial: PollApplicationList }) {
    const { poll } = initial;
    const [data, setData] = useState(initial);
    const [tab, setTab] = useState<PollApplicationStatus>("pending");
    const [category, setCategory] = useState<number | null>(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const latest = useRef(0);

    const indexOf = (id: number | null) => poll.categories.findIndex((item) => item.id === id);

    const load = useCallback(async () => {
        const params = new URLSearchParams({ holat: tab });
        if (category) params.set("yonalish", String(category));
        if (query.trim()) params.set("q", query.trim());
        const id = ++latest.current;
        setLoading(true);
        try {
            const response = await fetch(`/api/proxy/panel/polls/${poll.id}/arizalar?${params}`, {
                cache: "no-store",
            });
            if (!response.ok) return;
            const json = (await response.json()) as PollApplicationList;
            if (id === latest.current) setData(json);
        } catch {
            // Tarmoq uzilsa — eski ro'yxat qoladi
        } finally {
            if (id === latest.current) setLoading(false);
        }
    }, [poll.id, tab, category, query]);

    // Birinchi ochilishda server bergan ro'yxat bor — keyingi o'zgarishlarda yuklanadi
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const timer = setTimeout(load, query ? 300 : 0);
        return () => clearTimeout(timer);
    }, [load, query]);

    async function act(item: PollApplication, body: Record<string, unknown>, message: string) {
        setBusyId(item.id);
        setError(null);
        try {
            const response = await fetch(`/api/proxy/panel/polls/${poll.id}/arizalar/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const json = (await response.json().catch(() => null)) as
                | (PollApplication & { counts: PollApplicationList["counts"]; detail?: string })
                | null;
            if (!response.ok || !json) {
                setError(json?.detail ?? "Bajarib bo'lmadi.");
                return;
            }
            const { counts, ...updated } = json;
            setData((current) => ({
                ...current,
                counts,
                // Holati o'zgargan ariza joriy bo'limdan chiqadi
                results:
                    updated.status === tab
                        ? current.results.map((row) => (row.id === item.id ? updated : row))
                        : current.results.filter((row) => row.id !== item.id),
            }));
            // Saytdagi ro'yxat o'zgardi (tasdiqlandi yoki olib tashlandi)
            if (item.status === "approved" || updated.status === "approved") {
                await refreshPublic("polls");
            }
            setFlash(message);
        } catch {
            setError("Tarmoqda xatolik.");
        } finally {
            setBusyId(null);
        }
    }

    async function remove(item: PollApplication) {
        if (!confirm(`«${item.name}» arizasi butunlay o'chirilsinmi?`)) return;
        setBusyId(item.id);
        setError(null);
        try {
            const response = await fetch(`/api/proxy/panel/polls/${poll.id}/arizalar/${item.id}`, {
                method: "DELETE",
            });
            const json = (await response.json().catch(() => null)) as {
                counts?: PollApplicationList["counts"];
                detail?: string;
            } | null;
            if (!response.ok) {
                setError(json?.detail ?? "O'chirib bo'lmadi.");
                return;
            }
            setData((current) => ({
                ...current,
                counts: json?.counts ?? current.counts,
                results: current.results.filter((row) => row.id !== item.id),
            }));
            setFlash("O'chirildi.");
        } finally {
            setBusyId(null);
        }
    }

    const resultsHref = `/nazorat/elonlar/sorovnomalar/${poll.id}`;

    return (
        <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                    href="/nazorat/elonlar/sorovnomalar"
                    className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
                >
                    <Icon name="arrowLeft" size={14} />
                    So&apos;rovnomalar
                </Link>
                <Link href={resultsHref} className="text-[13px] text-muted hover:text-text">
                    Natijalar
                </Link>
            </div>

            <header className="tone-emerald relative mt-4 overflow-hidden rounded-3xl border border-line bg-raised p-5 md:p-7">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_22%,transparent),transparent_70%)]"
                />
                <div className="relative">
                    <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-tone-text">
                        Nomzod arizalari
                    </p>
                    <h1 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                        {poll.title}
                    </h1>
                    <p className="mt-1.5 text-[13px] text-muted">
                        Tasdiqlangan nomzod darhol saytda chiqadi. Telefon raqami faqat shu yerda ko&apos;rinadi.
                    </p>
                </div>
                {poll.apply_url ? (
                    <ApplyLink url={poll.apply_url} open={poll.apply_open} />
                ) : (
                    <p className="relative mt-4 text-[12.5px] text-faint">
                        Ariza havolasi hali yo&apos;q — so&apos;rovnomani tahrirlab, «Nomzodlar havola orqali ariza
                        bersin» kalitini yoqing.
                    </p>
                )}
            </header>

            <Flash text={flash} onDone={() => setFlash(null)} />

            {/* Holat bo'limlari */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
                {TABS.map((item) => {
                    const on = tab === item.value;
                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => setTab(item.value)}
                            className={cn(
                                item.tone,
                                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-medium transition-colors",
                                on
                                    ? "border-tone-line bg-tone-soft text-tone-text"
                                    : "border-line text-muted hover:text-text",
                            )}
                        >
                            {item.label}
                            <span
                                className={cn(
                                    "rounded-full px-1.5 text-[11.5px] tabular-nums",
                                    on ? "bg-tone text-page" : "bg-surface",
                                )}
                            >
                                {formatNumber(data.counts[item.value] ?? 0)}
                            </span>
                        </button>
                    );
                })}
                <span className={cn("ml-1 text-[12px] text-faint", !loading && "invisible")}>
                    Yuklanmoqda…
                </span>
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                {poll.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        <Chip on={category === null} onClick={() => setCategory(null)}>
                            Hammasi
                        </Chip>
                        {poll.categories.map((item, index) => (
                            <Chip
                                key={item.id}
                                on={category === item.id}
                                tone={nominationTone(index)}
                                onClick={() => setCategory(item.id)}
                            >
                                <span>{nominationEmoji(item)}</span>
                                <span className="max-w-[14rem] truncate">{item.title}</span>
                            </Chip>
                        ))}
                    </div>
                )}
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Ism, mahalla yoki telefon"
                    className={cn(INPUT, "lg:ml-auto lg:max-w-xs")}
                />
            </div>

            {error && (
                <p className="mt-4 inline-flex items-start gap-2 rounded-xl bg-warn-soft px-4 py-2.5 text-[13px] text-warn-text">
                    <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
                    {error}
                </p>
            )}

            {data.results.length ? (
                <ul className="mt-5 grid gap-3 xl:grid-cols-2">
                    <AnimatePresence initial={false}>
                        {data.results.map((item) => (
                            <motion.li
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ApplicationCard
                                    item={item}
                                    categories={poll.categories}
                                    toneIndex={indexOf(item.category)}
                                    busy={busyId === item.id}
                                    onApprove={() =>
                                        act(item, { status: "approved" }, `${item.name} saytga chiqdi.`)
                                    }
                                    onReject={() =>
                                        act(item, { status: "rejected" }, `${item.name} rad etildi.`)
                                    }
                                    onMove={(id) =>
                                        act(item, { category: id }, "Yo'nalish o'zgartirildi.")
                                    }
                                    onRemove={() => remove(item)}
                                />
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            ) : (
                <div className="mt-5">
                    <EmptyState
                        text={
                            tab === "pending"
                                ? "Yangi ariza yo'q. Havolani nomzodlarga yuboring — arizalar shu yerga keladi."
                                : "Bu bo'limda ariza yo'q."
                        }
                    />
                </div>
            )}
        </>
    );
}

function Chip({
    on,
    tone,
    onClick,
    children,
}: {
    on: boolean;
    tone?: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                tone,
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                on
                    ? tone
                        ? "border-tone-line bg-tone-soft font-medium text-tone-text"
                        : "border-text bg-invert font-medium text-on-invert"
                    : "border-line text-muted hover:text-text",
            )}
        >
            {children}
        </button>
    );
}

function ApplicationCard({
    item,
    categories,
    toneIndex,
    busy,
    onApprove,
    onReject,
    onMove,
    onRemove,
}: {
    item: PollApplication;
    categories: PollApplicationList["poll"]["categories"];
    toneIndex: number;
    busy: boolean;
    onApprove: () => void;
    onReject: () => void;
    onMove: (id: number) => void;
    onRemove: () => void;
}) {
    const tone = toneIndex >= 0 ? nominationTone(toneIndex) : "tone-slate";
    const place = [item.mahalla, item.district_display].filter(Boolean).join(" · ");

    return (
        <article
            className={cn(
                tone,
                "flex h-full gap-4 rounded-2xl border border-line bg-raised p-4 transition-opacity",
                busy && "opacity-60",
            )}
        >
            {item.photo ? (
                <a
                    href={item.photo}
                    target="_blank"
                    rel="noreferrer"
                    title="Rasmni to'liq ochish"
                    className="block size-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-surface"
                >
                    <Img src={item.photo} sizes="96px" maxWidth={256} className="size-full object-cover" />
                </a>
            ) : (
                <span className="grid size-24 shrink-0 place-items-center rounded-2xl bg-tone-soft text-[1.4rem] font-semibold text-tone-text">
                    {initials(item.name)}
                </span>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="truncate text-[15.5px] font-semibold">{item.name}</h3>
                        {place && <p className="truncate text-[12.5px] text-muted">{place}</p>}
                    </div>
                    <span className="shrink-0 text-[11.5px] tabular-nums text-faint">
                        {formatShortDate(item.created_at)}, {formatTime(item.created_at)}
                    </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {categories.length > 0 && (
                        <select
                            value={item.category ?? ""}
                            disabled={busy || item.votes > 0}
                            onChange={(event) => onMove(Number(event.target.value))}
                            aria-label="Yo'nalish"
                            className="max-w-full truncate rounded-full border border-tone-line bg-tone-soft px-3 py-1 text-[12px] font-medium text-tone-text outline-none"
                        >
                            {item.category === null && <option value="">Yo&apos;nalishsiz</option>}
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {nominationEmoji(category)} {category.title}
                                </option>
                            ))}
                        </select>
                    )}
                    {item.phone && (
                        <a
                            href={`tel:${item.phone}`}
                            className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[12px] tabular-nums text-muted hover:text-text"
                        >
                            <Icon name="phone" size={12} />
                            {item.phone}
                        </a>
                    )}
                    {item.votes > 0 && (
                        <span className="rounded-full bg-surface px-2.5 py-1 text-[12px] text-muted">
                            {formatNumber(item.votes)} ovoz
                        </span>
                    )}
                </div>

                {item.note && (
                    <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted">{item.note}</p>
                )}

                <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                    {item.status !== "approved" && (
                        <button
                            type="button"
                            onClick={onApprove}
                            disabled={busy}
                            className="tone-emerald inline-flex h-8 items-center gap-1.5 rounded-lg bg-tone px-3 text-[12.5px] font-medium text-page disabled:opacity-60"
                        >
                            <Icon name="check" size={13} strokeWidth={2.6} />
                            {item.status === "rejected" ? "Qayta tasdiqlash" : "Tasdiqlash"}
                        </button>
                    )}
                    {item.status !== "rejected" && (
                        <button
                            type="button"
                            onClick={onReject}
                            disabled={busy || item.votes > 0}
                            title={item.votes > 0 ? "Ovozi bor nomzodni rad etib bo'lmaydi" : undefined}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-[12.5px] text-muted transition-colors hover:text-text disabled:opacity-50"
                        >
                            <Icon name="ban" size={13} />
                            {item.status === "approved" ? "Saytdan olish" : "Rad etish"}
                        </button>
                    )}
                    {item.status !== "approved" && (
                        <button
                            type="button"
                            onClick={onRemove}
                            disabled={busy}
                            title="O'chirish"
                            className="grid size-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-warn-soft hover:text-warn-text disabled:opacity-50"
                        >
                            <Icon name="trash" size={13} />
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}
