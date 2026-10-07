"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { PollStatus } from "@/components/panel/polls-panel";
import { medalOf } from "@/components/polls/poll-ui";
import { Flash, INPUT } from "@/components/panel/ui";
import { UserDrawer } from "@/components/panel/user-drawer";
import { cn } from "@/lib/cn";
import { formatNumber, formatShortDate, formatTime, tashkentParts } from "@/lib/format";
import type { PollResults } from "@/lib/types";

/** Natijalar ochiq turgan bo'lsa shuncha vaqtda bir yangilanadi */
const REFRESH_MS = 15_000;

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

/** Oxirgi `count` kun (Toshkent kalendari) — ovoz bo'lmagan kunlar ham 0 bilan. */
function lastDays(daily: PollResults["daily"], count = 14) {
    const today = tashkentParts(new Date());
    const start = Date.UTC(today.year, today.month - 1, today.day);
    const byDate = new Map(daily.map((row) => [row.date, row.votes]));

    return Array.from({ length: count }, (_, index) => {
        const date = new Date(start - (count - 1 - index) * 86_400_000);
        const key = date.toISOString().slice(0, 10);
        return { key, day: date.getUTCDate(), votes: byDate.get(key) ?? 0 };
    });
}

export function PollResultsView({ initial }: { initial: PollResults }) {
    const [data, setData] = useState(initial);
    const [option, setOption] = useState<number | null>(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const filters = useRef({ option, query });
    // Faqat eng oxirgi so'rov javobi ko'rsatiladi (kech kelgan eskisi emas)
    const latest = useRef(0);
    useEffect(() => {
        filters.current = { option, query };
    }, [option, query]);

    const load = useCallback(
        async (quiet = false) => {
            const params = new URLSearchParams();
            if (filters.current.option) params.set("option", String(filters.current.option));
            if (filters.current.query.trim()) params.set("q", filters.current.query.trim());
            const id = ++latest.current;
            if (!quiet) setLoading(true);
            try {
                const response = await fetch(
                    `/api/proxy/panel/polls/${initial.id}/natijalar?${params}`,
                    { cache: "no-store" },
                );
                if (!response.ok) return;
                const json = (await response.json()) as PollResults;
                if (id === latest.current) setData(json);
            } catch {
                // Tarmoq uzilsa — eski natija qoladi
            } finally {
                if (id === latest.current) setLoading(false);
            }
        },
        [initial.id],
    );

    // Filtr o'zgarsa — qidiruv yozilayotganda har harfga emas, biroz kutib
    const first = useRef(true);
    useEffect(() => {
        if (first.current) {
            first.current = false;
            return;
        }
        const timer = setTimeout(() => load(), 300);
        return () => clearTimeout(timer);
    }, [option, query, load]);

    // Ovoz berish davom etayotgan bo'lsa — jonli yangilanadi (sahifa ko'rinib turganda)
    useEffect(() => {
        if (!data.is_open) return;
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") load(true);
        }, REFRESH_MS);
        return () => clearInterval(timer);
    }, [data.is_open, load]);

    const total = data.total_votes;
    const [leader, runnerUp] = data.options;
    const margin = leader && runnerUp ? (leader.votes ?? 0) - (runnerUp.votes ?? 0) : null;
    const maxVotes = leader?.votes || 1;
    const maxDistrict = data.districts[0]?.votes || 1;
    const days = lastDays(data.daily);
    const maxDay = Math.max(1, ...days.map((day) => day.votes));
    const chosen = data.options.find((item) => item.id === option);

    return (
        <>
            <Link
                href="/nazorat/elonlar/sorovnomalar"
                className="inline-flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-text"
            >
                <Icon name="arrowLeft" size={14} />
                So&apos;rovnomalar
            </Link>

            {/* Sarlavha */}
            <header className="tone-amber relative mt-4 overflow-hidden rounded-3xl border border-line bg-raised p-5 md:p-7">
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_22%,transparent),transparent_70%)]"
                />
                <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
                    <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-tone-line bg-tone-soft text-tone-text">
                        {data.image ? (
                            <Img
                                src={data.image}
                                sizes="80px"
                                maxWidth={256}
                                className="size-full object-cover"
                            />
                        ) : (
                            <Icon name="vote" size={28} />
                        )}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <PollStatus poll={data} />
                        </div>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-[1.75rem]">
                            {data.title}
                        </h1>
                        <p className="mt-1.5 text-[13px] text-muted">
                            Natijalar alohida — faqat panel adminlari ko&apos;radi.
                            {data.is_open && " Har 15 soniyada o'zi yangilanadi."}
                        </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => load()}
                            title="Yangilash"
                            className="grid size-10 place-items-center rounded-full border border-line bg-page text-muted transition-colors hover:text-text"
                        >
                            <Icon
                                name="chart"
                                size={16}
                                className={cn(loading && "animate-pulse")}
                            />
                        </button>
                        <Link
                            href={data.url}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2.5 text-[13px] font-medium text-on-invert transition-opacity hover:opacity-90"
                        >
                            Saytda ochish
                            <Icon name="arrowRight" size={14} />
                        </Link>
                    </div>
                </div>
            </header>

            <Flash text={flash} onDone={() => setFlash(null)} />

            {/* Raqamlar */}
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                    label="Jami ovoz"
                    value={formatNumber(total)}
                    icon="vote"
                    tone="tone-emerald"
                />
                <Stat
                    label="Nomzodlar"
                    value={formatNumber(data.options_count)}
                    icon="users"
                    tone="tone-violet"
                />
                <Stat
                    label="Yetakchi"
                    value={total && leader ? leader.name : "—"}
                    hint={
                        total && leader
                            ? `${formatNumber(leader.votes ?? 0)} ovoz · ${leader.percent}%`
                            : "Hali ovoz yo'q"
                    }
                    icon="trophy"
                    tone="tone-amber"
                    small
                />
                <Stat
                    label="2-o'rindan farqi"
                    value={margin === null || !total ? "—" : `${formatNumber(margin)} ovoz`}
                    hint={runnerUp && total ? runnerUp.name : undefined}
                    icon="chart"
                    tone="tone-blue"
                    small
                />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
                {/* Reyting */}
                <section className="rounded-2xl border border-line bg-raised p-4 md:p-5">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-[15px] font-semibold">Reyting</h2>
                        <span className="text-[12px] text-faint">
                            Bosilsa — kim ovoz bergani ko&apos;rinadi
                        </span>
                    </div>

                    <ol className="mt-4 space-y-1.5">
                        {data.options.map((item) => {
                            // Saytdagidek: medal faqat zinapoya chegarasidan o'tganlarga
                            const medal = medalOf(item, data.podium_min_votes ?? 1000);
                            const active = option === item.id;
                            return (
                                <motion.li
                                    layout
                                    key={item.id}
                                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOption(active ? null : item.id)}
                                        className={cn(
                                            "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                                            active
                                                ? "border-accent bg-accent-soft/40"
                                                : "border-transparent hover:bg-surface",
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                "grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-bold tabular-nums",
                                                medal
                                                    ? `${medal} bg-tone-soft text-tone-text`
                                                    : "bg-surface text-faint",
                                            )}
                                        >
                                            {item.rank}
                                        </span>
                                        <span className="tone-amber grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border border-line bg-tone-soft text-[12px] font-semibold text-tone-text">
                                            {item.photo ? (
                                                <Img
                                                    src={item.photo}
                                                    sizes="40px"
                                                    maxWidth={128}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                initials(item.name)
                                            )}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-baseline justify-between gap-3">
                                                <span className="truncate text-[14px] font-medium">
                                                    {item.name}
                                                </span>
                                                <span className="shrink-0 text-[13px] font-semibold tabular-nums">
                                                    {formatNumber(item.votes ?? 0)}
                                                    <span className="ml-1.5 text-[11.5px] font-normal text-faint">
                                                        {item.percent}%
                                                    </span>
                                                </span>
                                            </span>
                                            <span className="mt-0.5 block truncate text-[12px] text-faint">
                                                {[
                                                    item.mahalla && `${item.mahalla} mahallasi`,
                                                    item.district_display,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" · ") || "—"}
                                            </span>
                                            <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface">
                                                <motion.span
                                                    className={cn(
                                                        "block h-full rounded-full",
                                                        medal ? `${medal} bg-tone` : "bg-accent",
                                                    )}
                                                    initial={false}
                                                    animate={{
                                                        width: `${((item.votes ?? 0) / maxVotes) * 100}%`,
                                                    }}
                                                    transition={{
                                                        duration: 0.6,
                                                        ease: [0.22, 1, 0.36, 1],
                                                    }}
                                                />
                                            </span>
                                        </span>
                                    </button>
                                </motion.li>
                            );
                        })}
                    </ol>
                </section>

                <div className="space-y-5">
                    {/* Tumanlar */}
                    <section className="rounded-2xl border border-line bg-raised p-4 md:p-5">
                        <h2 className="text-[15px] font-semibold">
                            Ovoz berganlar — tumanlar kesimida
                        </h2>
                        {data.districts.length ? (
                            <ul className="mt-4 space-y-2.5">
                                {data.districts.map((row) => (
                                    <li key={row.district || "none"}>
                                        <div className="flex items-baseline justify-between gap-3 text-[12.5px]">
                                            <span className="truncate">{row.label}</span>
                                            <span className="shrink-0 tabular-nums text-muted">
                                                {formatNumber(row.votes)}
                                                <span className="ml-1.5 text-faint">
                                                    {total
                                                        ? Math.round((row.votes * 100) / total)
                                                        : 0}
                                                    %
                                                </span>
                                            </span>
                                        </div>
                                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface">
                                            <span
                                                className="tone-violet block h-full rounded-full bg-tone"
                                                style={{
                                                    width: `${(row.votes / maxDistrict) * 100}%`,
                                                }}
                                            />
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-3 text-[13px] text-faint">Hali ovoz yo&apos;q.</p>
                        )}
                    </section>

                    {/* Kunlar */}
                    <section className="rounded-2xl border border-line bg-raised p-4 md:p-5">
                        <h2 className="text-[15px] font-semibold">Oxirgi 14 kun</h2>
                        <div className="mt-4 flex h-28 items-end gap-1">
                            {days.map((day) => (
                                <div
                                    key={day.key}
                                    className="group relative flex h-full flex-1 flex-col justify-end"
                                >
                                    <span
                                        className="tone-emerald block min-h-[3px] rounded-t-md bg-tone/80 transition-colors group-hover:bg-tone"
                                        style={{ height: `${(day.votes / maxDay) * 100}%` }}
                                    />
                                    <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-invert px-1.5 py-0.5 text-[10.5px] text-on-invert group-hover:block">
                                        {day.votes}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-1.5 flex gap-1 text-center text-[10px] tabular-nums text-faint">
                            {days.map((day) => (
                                <span key={day.key} className="flex-1">
                                    {day.day}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* Ovoz berganlar */}
            <section className="mt-5 rounded-2xl border border-line bg-raised p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[15px] font-semibold">
                        Ovoz berganlar{" "}
                        <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-[12px] font-medium text-muted">
                            {formatNumber(data.voters_count)}
                        </span>
                    </h2>
                    <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                        <AnimatePresence>
                            {chosen && (
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={() => setOption(null)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[12.5px] font-medium text-accent-text"
                                >
                                    {chosen.name}
                                    <Icon name="close" size={12} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <div className="relative w-full max-w-xs">
                            <Icon
                                name="search"
                                size={15}
                                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
                            />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Ism yoki telefon"
                                className={`${INPUT} py-2 pl-10`}
                            />
                        </div>
                    </div>
                </div>

                {data.voters.length ? (
                    <div
                        className={cn(
                            "mt-4 overflow-x-auto transition-opacity",
                            loading && "opacity-60",
                        )}
                    >
                        <table className="w-full min-w-[640px] text-left text-[13px]">
                            <thead className="text-[11.5px] uppercase tracking-[0.06em] text-faint">
                                <tr className="border-b border-line">
                                    <th className="py-2 pr-3 font-medium">F.I.O.</th>
                                    <th className="py-2 pr-3 font-medium">Telefon</th>
                                    <th className="py-2 pr-3 font-medium">Tuman</th>
                                    <th className="py-2 pr-3 font-medium">Kimga</th>
                                    <th className="py-2 font-medium">Vaqt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.voters.map((vote) => (
                                    <tr
                                        key={vote.id}
                                        className="border-b border-line-soft last:border-0"
                                    >
                                        <td className="py-2.5 pr-3">
                                            <button
                                                type="button"
                                                onClick={() => setUserId(vote.user_id)}
                                                className="font-medium hover:text-accent hover:underline"
                                            >
                                                {vote.full_name || "—"}
                                            </button>
                                        </td>
                                        <td className="py-2.5 pr-3 tabular-nums text-muted">
                                            {vote.phone || "—"}
                                        </td>
                                        <td className="py-2.5 pr-3 text-muted">
                                            {vote.district || "—"}
                                        </td>
                                        <td className="py-2.5 pr-3">{vote.option}</td>
                                        <td className="whitespace-nowrap py-2.5 tabular-nums text-faint">
                                            {formatShortDate(vote.created_at)},{" "}
                                            {formatTime(vote.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.voters_count > data.voters.length && (
                            <p className="mt-3 text-center text-[12px] text-faint">
                                Oxirgi {formatNumber(data.voters.length)} tasi ko&apos;rsatildi —
                                qidiruv yoki nomzod bo&apos;yicha saralang.
                            </p>
                        )}
                    </div>
                ) : (
                    <p className="mt-4 rounded-xl border border-dashed border-line py-10 text-center text-[13px] text-muted">
                        {query || option
                            ? "Bu bo'yicha hech kim topilmadi."
                            : "Hali hech kim ovoz bermagan."}
                    </p>
                )}
            </section>

            <UserDrawer
                userId={userId}
                onClose={() => setUserId(null)}
                onChanged={setFlash}
                onDeleted={(message) => {
                    setUserId(null);
                    setFlash(message);
                    load(true);
                }}
            />
        </>
    );
}

function Stat({
    label,
    value,
    hint,
    icon,
    tone,
    small,
}: {
    label: string;
    value: string;
    hint?: string;
    icon: "vote" | "users" | "trophy" | "chart";
    tone: string;
    small?: boolean;
}) {
    return (
        <div className={cn(tone, "rounded-2xl border border-line bg-raised p-4")}>
            <span className="inline-flex items-center gap-2 text-[12px] text-muted">
                <span className="grid size-7 place-items-center rounded-lg bg-tone-soft text-tone-text">
                    <Icon name={icon} size={14} />
                </span>
                {label}
            </span>
            <p
                className={cn(
                    "mt-3 truncate font-semibold tracking-tight",
                    small ? "text-[16px]" : "text-[1.75rem] leading-none tabular-nums",
                )}
                title={value}
            >
                {value}
            </p>
            {hint && <p className="mt-1 truncate text-[12px] text-faint">{hint}</p>}
        </div>
    );
}
