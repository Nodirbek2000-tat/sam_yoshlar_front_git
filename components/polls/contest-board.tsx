"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { RichText } from "@/components/rich-text";
import { cn } from "@/lib/cn";
import { foldText, formatNumber, formatShortDate, formatTime } from "@/lib/format";
import type { Poll, PollCategory, PollOption, PollVoteResult } from "@/lib/types";
import { useSessionUser } from "@/lib/use-session-user";

import { inNomination, nominationEmoji, nominationsOf, nominationTone } from "./contest-ui";
import { HeroStat, Num, remaining, ShareButton, useNow } from "./poll-board";
import { Avatar, initials, medalOf, placeOf, PollPill, qualifies } from "./poll-ui";

const VoteDialog = dynamic(() => import("./vote-dialog"), { ssr: false });

/** Ovoz berish davom etayotganda reyting shuncha vaqtda bir yangilanadi */
const REFRESH_MS = 12_000;

/** Bir martada ko'rsatiladigan nomzodlar */
const PAGE = 24;

/** Yo'nalish havolada: /sorovnomalar/<slug>?yonalish=3 — ulashilganda o'sha yo'nalish ochiladi */
const PARAM = "yonalish";

/**
 * Yo'nalishli so'rovnoma — yetakchilar tanlovi.
 *
 * Har yo'nalish (nominatsiya) o'z reytingiga ega: eng ko'p ovoz olgan
 * tepaga chiqadi, ovozlar soni va ulushi kartada ko'rinadi. Har kim har
 * yo'nalishda bittadan ovoz beradi.
 */
export function ContestBoard({ initial }: { initial: Poll }) {
    const router = useRouter();
    const { user, ready } = useSessionUser();
    const [poll, setPoll] = useState<Poll>(initial);
    const nominations = useMemo(() => nominationsOf(poll), [poll]);
    const [active, setActive] = useState<number>(() => nominations[0]?.id ?? 0);
    const [query, setQuery] = useState("");
    const [district, setDistrict] = useState("");
    const [limit, setLimit] = useState(PAGE);
    const [target, setTarget] = useState<PollOption | null>(null);
    const now = useNow();
    const sequence = useRef(0);
    const listRef = useRef<HTMLElement>(null);

    const reveal = poll.show_results;
    const min = poll.podium_min_votes ?? 1000;
    const path = `/sorovnomalar/${poll.slug}`;
    const myVotes = useMemo(
        () => poll.my_votes ?? (poll.my_vote ? [poll.my_vote] : []),
        [poll.my_votes, poll.my_vote],
    );

    const activeIndex = Math.max(0, nominations.findIndex((item) => item.id === active));
    const nomination = nominations[activeIndex];
    const tone = nominationTone(activeIndex);

    // Havoladagi yo'nalish (?yonalish=3) — sahifa ochilganda bir marta
    useEffect(() => {
        const wanted = Number(new URLSearchParams(window.location.search).get(PARAM));
        if (wanted && nominations.some((item) => item.id === wanted)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActive(wanted);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const choose = useCallback((id: number, scroll = false) => {
        setActive(id);
        setQuery("");
        setDistrict("");
        setLimit(PAGE);
        const url = new URL(window.location.href);
        url.searchParams.set(PARAM, String(id));
        window.history.replaceState(null, "", url);
        if (scroll) listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    const refresh = useCallback(() => {
        const id = ++sequence.current;
        fetch(`/api/proxy/polls/${initial.slug}`, { cache: "no-store" })
            .then((response) => (response.ok ? (response.json() as Promise<Poll>) : null))
            .then((data) => {
                if (!data || id !== sequence.current) return;
                // Ovoz qaytarib olinmaydi — eski javob berilgan ovozlarni «yo'qotmasin»
                setPoll((previous) => {
                    const kept = new Set([...(previous.my_votes ?? []), ...(data.my_votes ?? [])]);
                    return { ...data, my_votes: [...kept] };
                });
            })
            .catch(() => null);
    }, [initial.slug]);

    useEffect(() => {
        refresh();
        if (!initial.is_open) return;
        const timer = setInterval(() => {
            if (document.visibilityState === "visible") refresh();
        }, REFRESH_MS);
        const onVisible = () => document.visibilityState === "visible" && refresh();
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [initial.is_open, refresh]);

    // Server reyting tartibida beradi — yo'nalish ichida ham tartib saqlanadi
    const options = useMemo(
        () => (nomination ? poll.options.filter((option) => inNomination(option, nomination.id)) : []),
        [poll.options, nomination],
    );
    const chosen = options.find((option) => myVotes.includes(option.id)) ?? null;
    const votedIn = useMemo(() => {
        const set = new Set<number>();
        for (const option of poll.options) {
            if (myVotes.includes(option.id)) set.add(option.category ?? 0);
        }
        return set;
    }, [poll.options, myVotes]);
    const nominationTotal = nomination?.total_votes ?? 0;
    const leaderVotes = options[0]?.votes || 1;

    const districts = useMemo(() => {
        const seen = new Map<string, string>();
        for (const option of options) {
            if (option.district) seen.set(option.district, option.district_display);
        }
        return [...seen].sort((a, b) => a[1].localeCompare(b[1]));
    }, [options]);

    const visible = useMemo(() => {
        const text = foldText(query);
        return options.filter(
            (option) =>
                (!district || option.district === district) &&
                (!text || foldText(`${option.name} ${option.mahalla}`).includes(text)),
        );
    }, [options, query, district]);

    function startVote(option: PollOption) {
        if (!poll.is_open || chosen) return;
        if (ready && !user) {
            router.push(`/kirish?next=${encodeURIComponent(`${path}?${PARAM}=${active}`)}`);
            return;
        }
        setTarget(option);
    }

    function onVoted(result: PollVoteResult) {
        sequence.current += 1;
        setPoll(result);
    }

    return (
        <>
            {/* ------------------------------------------------ Sarlavha */}
            <section className={cn(tone, "relative overflow-hidden border-b border-line")}>
                <div aria-hidden className="aurora" />
                <div className="grid-lines absolute inset-0 opacity-[0.3] [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]" />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-40 -top-48 size-[38rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_24%,transparent),transparent_68%)] transition-colors duration-700"
                />

                {/* `min-w-0` — grid ustuni ichidagi uzun (qisqartiriladigan) matn bilan kengayib ketmasin */}
                <div className="container-page relative grid gap-10 py-10 md:py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center">
                    <div className="min-w-0">
                        <nav className="flex items-center gap-2 text-[12.5px] text-faint">
                            <Link href="/elonlar" className="hover:text-text">
                                E&apos;lonlar
                            </Link>
                            <span>/</span>
                            <Link href="/sorovnomalar" className="hover:text-text">
                                So&apos;rovnomalar
                            </Link>
                        </nav>

                        <PollPill poll={poll} className="mt-5" />

                        <h1 className="mt-4 max-w-2xl text-[2.1rem] font-semibold leading-[1.06] tracking-tight sm:text-5xl">
                            {poll.title}
                        </h1>

                        {poll.description && (
                            <RichText
                                text={poll.description}
                                className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted"
                            />
                        )}

                        <dl className="mt-7 grid max-w-lg grid-cols-3 gap-2.5">
                            <HeroStat label="Jami ovoz">
                                {reveal ? <Num value={poll.total_votes ?? 0} /> : "—"}
                            </HeroStat>
                            <HeroStat label="Nomzodlar">{formatNumber(poll.options_count)}</HeroStat>
                            <HeroStat label={poll.is_closed ? "Holat" : "Qolgan vaqt"}>
                                <span
                                    className="text-[15px]"
                                    title={
                                        poll.ends_at
                                            ? `${formatShortDate(poll.ends_at)}, ${formatTime(poll.ends_at)}`
                                            : undefined
                                    }
                                >
                                    {poll.is_closed
                                        ? "Tugagan"
                                        : poll.ends_at
                                          ? now
                                              ? remaining(poll.ends_at, now)
                                              : formatShortDate(poll.ends_at)
                                          : "Ochiq"}
                                </span>
                            </HeroStat>
                        </dl>

                        {/* Har yo'nalishda bitta ovoz — qaysilarida berilgani nuqtalarda */}
                        {nominations.length > 1 && (
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <span className="flex gap-1.5">
                                    {nominations.map((item, index) => (
                                        <span
                                            key={item.id}
                                            title={item.title}
                                            className={cn(
                                                nominationTone(index),
                                                "size-2.5 rounded-full transition-colors duration-500",
                                                votedIn.has(item.id) ? "bg-tone" : "bg-line",
                                            )}
                                        />
                                    ))}
                                </span>
                                <span className="text-[13px] text-muted">
                                    {votedIn.size
                                        ? `${votedIn.size} / ${nominations.length} yo'nalishda ovoz berdingiz`
                                        : `Har ${nominations.length} yo'nalishda bittadan ovoz berasiz`}
                                </span>
                            </div>
                        )}

                        <div className="mt-7 flex flex-wrap items-center gap-2.5">
                            {poll.is_open && (
                                <a
                                    href="#nomzodlar"
                                    className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-3 text-[14px] font-medium text-on-invert transition-transform hover:-translate-y-0.5"
                                >
                                    <Icon name="vote" size={16} />
                                    Ovoz berish
                                </a>
                            )}
                            <ShareButton title={poll.title} path={path} />
                        </div>
                    </div>

                    <LeadersPanel
                        poll={poll}
                        nominations={nominations}
                        active={active}
                        min={min}
                        onPick={(id) => choose(id, true)}
                    />
                </div>
            </section>

            {/* ------------------------------------------------ Yo'nalishlar lentasi */}
            <nav
                aria-label="Yo'nalishlar"
                className="sticky top-15 z-30 border-b border-line bg-page/90 backdrop-blur-md"
            >
                <div className="container-page">
                    <div className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 py-3 [scrollbar-width:none] md:-mx-8 md:px-8">
                        {nominations.map((item, index) => {
                            const on = item.id === active;
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => choose(item.id)}
                                    aria-pressed={on}
                                    className={cn(
                                        nominationTone(index),
                                        "inline-flex shrink-0 snap-start items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-[13px] font-medium transition-all duration-300",
                                        on
                                            ? "border-tone-line bg-tone text-page shadow-[0_10px_24px_-14px_var(--tone)]"
                                            : "border-line bg-raised text-muted hover:border-tone-line hover:text-text",
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "grid size-7 place-items-center rounded-full text-[15px]",
                                            on ? "bg-page/25" : "bg-tone-soft",
                                        )}
                                    >
                                        {nominationEmoji(item)}
                                    </span>
                                    <span className="max-w-[15rem] truncate">{item.title}</span>
                                    {votedIn.has(item.id) ? (
                                        <Icon name="check" size={13} strokeWidth={3} />
                                    ) : (
                                        <span
                                            className={cn(
                                                "rounded-full px-1.5 text-[11px] tabular-nums",
                                                on ? "bg-page/25" : "bg-surface",
                                            )}
                                        >
                                            {item.options_count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* ------------------------------------------------ Tanlangan yo'nalish */}
            <section
                id="nomzodlar"
                ref={listRef}
                className={cn(tone, "container-page scroll-mt-32 py-8 md:py-12")}
            >
                {nomination ? (
                    <>
                        <AnimatePresence mode="wait">
                            <motion.header
                                key={nomination.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                className="relative overflow-hidden rounded-[2rem] border border-tone-line bg-tone-soft p-5 md:p-7"
                            >
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_30%,transparent),transparent_70%)]"
                                />
                                <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
                                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-page text-[32px] shadow-[0_14px_30px_-16px_var(--tone)]">
                                        {nominationEmoji(nomination)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-tone-text">
                                            Yo&apos;nalish {activeIndex + 1} / {nominations.length}
                                        </p>
                                        <h2 className="mt-1 text-[1.45rem] font-semibold leading-tight tracking-tight md:text-[1.75rem]">
                                            {nomination.title}
                                        </h2>
                                        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
                                            <span>{formatNumber(nomination.options_count)} nomzod</span>
                                            {reveal && (
                                                <span className="font-medium text-text">
                                                    <Num value={nominationTotal} /> ovoz
                                                </span>
                                            )}
                                            {reveal && poll.is_open && (
                                                <span className="inline-flex items-center gap-1.5 text-tone-text">
                                                    <span className="poll-live relative size-1.5 rounded-full bg-tone" />
                                                    Jonli reyting
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <VoteState
                                        poll={poll}
                                        chosen={chosen}
                                        guest={ready && !user}
                                        loginHref={`/kirish?next=${encodeURIComponent(`${path}?${PARAM}=${active}`)}`}
                                    />
                                </div>
                            </motion.header>
                        </AnimatePresence>

                        {options.length > 8 && (
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative flex-1 sm:max-w-sm">
                                    <Icon
                                        name="search"
                                        size={16}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
                                    />
                                    <input
                                        type="search"
                                        value={query}
                                        onChange={(event) => {
                                            setQuery(event.target.value);
                                            setLimit(PAGE);
                                        }}
                                        placeholder="Ism yoki mahalla bo'yicha qidirish"
                                        aria-label="Nomzodni ism yoki mahalla bo'yicha qidirish"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        className="w-full rounded-full border border-line bg-raised py-2.5 pl-11 pr-4 text-[16px] outline-none transition-colors placeholder:text-faint focus:border-accent sm:text-[14px]"
                                    />
                                </div>
                                {districts.length > 1 && (
                                    <select
                                        value={district}
                                        onChange={(event) => {
                                            setDistrict(event.target.value);
                                            setLimit(PAGE);
                                        }}
                                        aria-label="Tuman bo'yicha"
                                        className="rounded-full border border-line bg-raised px-4 py-2.5 text-[16px] outline-none focus:border-accent sm:text-[14px]"
                                    >
                                        <option value="">Barcha tumanlar</option>
                                        {districts.map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        {visible.length ? (
                            <motion.ol
                                key={nomination.id}
                                className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
                            >
                                {visible.slice(0, limit).map((option, index) => (
                                    <LeaderCard
                                        key={option.id}
                                        option={option}
                                        tone={tone}
                                        reveal={reveal}
                                        min={min}
                                        total={nominationTotal}
                                        ratio={(option.votes ?? 0) / leaderVotes}
                                        place={reveal ? ((option.votes ?? 0) > 0 ? option.rank : undefined) : undefined}
                                        mine={chosen?.id === option.id}
                                        canVote={poll.is_open && !chosen}
                                        priority={index < 4}
                                        onVote={() => startVote(option)}
                                    />
                                ))}
                            </motion.ol>
                        ) : (
                            <div className="mt-6 rounded-3xl border border-dashed border-line py-16 text-center">
                                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-tone-soft text-[26px]">
                                    {nominationEmoji(nomination)}
                                </span>
                                <p className="mt-4 text-[14px] text-muted">
                                    {options.length
                                        ? "Bu bo'yicha nomzod topilmadi."
                                        : "Bu yo'nalishda hali nomzod yo'q — tez orada qo'shiladi."}
                                </p>
                            </div>
                        )}

                        {visible.length > limit && (
                            <div className="mt-8 text-center">
                                <button
                                    type="button"
                                    onClick={() => setLimit((value) => value + PAGE)}
                                    className="rounded-full border border-line bg-raised px-6 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-surface"
                                >
                                    Yana ko&apos;rsatish ({visible.length - limit})
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p className="rounded-3xl border border-dashed border-line py-16 text-center text-[14px] text-muted">
                        Hozircha nomzodlar yo&apos;q.
                    </p>
                )}
            </section>

            {target && nomination && (
                <VoteDialog
                    slug={poll.slug}
                    option={target}
                    reveal={reveal}
                    min={min}
                    title={`${poll.title} — ${nomination.title}`}
                    path={`${path}?${PARAM}=${active}`}
                    rule="Har bir yo'nalishda faqat bir marta ovoz berasiz — keyin o'zgartirib bo'lmaydi. Boshqa yo'nalishlarda ham ovoz bera olasiz."
                    tone={tone}
                    onClose={() => setTarget(null)}
                    onVoted={onVoted}
                    onConflict={refresh}
                />
            )}
        </>
    );
}

/** Sarlavhadagi jadval: har yo'nalish peshqadami — bosilsa o'sha yo'nalish ochiladi. */
function LeadersPanel({
    poll,
    nominations,
    active,
    min,
    onPick,
}: {
    poll: Poll;
    nominations: PollCategory[];
    active: number;
    min: number;
    onPick: (id: number) => void;
}) {
    return (
        <div className="relative min-w-0 rounded-[2rem] border border-line bg-page/75 p-3 shadow-[0_30px_70px_-40px_rgba(0,0,0,0.35)] backdrop-blur sm:p-4">
            <p className="px-2 pb-2 pt-1 text-[12px] font-medium uppercase tracking-[0.14em] text-faint">
                {poll.is_closed ? "G'oliblar" : "Yo'nalishlar peshqadamlari"}
            </p>
            <ul className="space-y-1.5">
                {nominations.map((item, index) => {
                    const first = poll.options.find((option) => inNomination(option, item.id));
                    const leader = poll.show_results && qualifies(first, min) ? first : null;
                    const others = poll.options.filter((option) => inNomination(option, item.id)).slice(0, 4);
                    const on = item.id === active;
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onPick(item.id)}
                                className={cn(
                                    nominationTone(index),
                                    "group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-300",
                                    on
                                        ? "border-tone-line bg-tone-soft"
                                        : "border-transparent hover:border-line hover:bg-raised",
                                )}
                            >
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tone-soft text-[19px] transition-transform duration-300 group-hover:scale-110">
                                    {nominationEmoji(item)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[12.5px] text-muted">{item.title}</span>
                                    <span className="mt-0.5 block truncate text-[14px] font-semibold">
                                        {leader ? (
                                            leader.name
                                        ) : item.options_count ? (
                                            <span className="font-normal text-faint">
                                                {item.options_count} nomzod · ovoz bering
                                            </span>
                                        ) : (
                                            <span className="font-normal text-faint">Nomzodlar kutilmoqda</span>
                                        )}
                                    </span>
                                </span>
                                {leader ? (
                                    <span className="flex shrink-0 items-center gap-2">
                                        <span className="text-right">
                                            <span className="block text-[14px] font-semibold tabular-nums leading-none">
                                                <Num value={leader.votes ?? 0} />
                                            </span>
                                            <span className="text-[11px] text-faint">ovoz</span>
                                        </span>
                                        <span className="relative">
                                            <Avatar option={leader} size={38} className="rounded-full ring-2 ring-tone/60" />
                                            <span className="absolute -right-1 -top-1.5 grid size-4 place-items-center rounded-full bg-tone text-page">
                                                <Icon name="trophy" size={9} />
                                            </span>
                                        </span>
                                    </span>
                                ) : others.length ? (
                                    <span className="hidden shrink-0 items-center sm:flex">
                                        {others.map((option, position) => (
                                            <Avatar
                                                key={option.id}
                                                option={option}
                                                size={28}
                                                className={cn("rounded-full ring-2 ring-page", position && "-ml-2")}
                                            />
                                        ))}
                                    </span>
                                ) : null}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/** Yo'nalish sarlavhasining o'ng tomoni: ovoz berilganmi, kirish kerakmi. */
function VoteState({
    poll,
    chosen,
    guest,
    loginHref,
}: {
    poll: Poll;
    chosen: PollOption | null;
    guest: boolean;
    loginHref: string;
}) {
    if (chosen) {
        return (
            <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-page/80 p-2.5 pr-4">
                <Avatar option={chosen} size={42} className="rounded-xl" />
                <div className="min-w-0">
                    <p className="inline-flex items-center gap-1 text-[11.5px] font-medium uppercase tracking-[0.08em] text-tone-text">
                        <Icon name="check" size={12} strokeWidth={3} />
                        Ovozingiz
                    </p>
                    <p className="max-w-[12rem] truncate text-[14px] font-semibold">{chosen.name}</p>
                </div>
            </div>
        );
    }
    if (poll.is_closed) {
        return (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-page/80 px-4 py-2 text-[13px] text-muted">
                <Icon name="trophy" size={14} />
                Ovoz berish yakunlangan
            </span>
        );
    }
    if (guest) {
        return (
            <Link
                href={loginHref}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert"
            >
                <Icon name="telegram" size={15} />
                Ovoz berish uchun kiring
            </Link>
        );
    }
    return poll.is_open ? (
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-page/80 px-4 py-2 text-[13px] text-muted">
            <Icon name="vote" size={14} className="text-tone-text" />
            Bu yo&apos;nalishda 1 ta ovoz berasiz
        </span>
    ) : null;
}

/** Nomzod kartasi: katta surat, o'rni, ovozlar soni va ulushi, ovoz berish tugmasi. */
function LeaderCard({
    option,
    tone,
    reveal,
    min,
    total,
    ratio,
    place,
    mine,
    canVote,
    priority,
    onVote,
}: {
    option: PollOption;
    tone: string;
    reveal: boolean;
    min: number;
    total: number;
    ratio: number;
    /** O'rin raqami; `undefined` — hali ovozi yo'q yoki natijalar yopiq */
    place: number | undefined;
    mine: boolean;
    canVote: boolean;
    priority: boolean;
    onVote: () => void;
}) {
    const medal = reveal ? medalOf(option, min) : null;
    const where = placeOf(option);
    const crown = medal && place === 1;

    return (
        <motion.li
            layout="position"
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={cn(
                medal ?? tone,
                "group relative flex flex-col overflow-hidden rounded-3xl border bg-raised transition-shadow duration-300",
                mine
                    ? "border-tone-line ring-2 ring-tone/50"
                    : medal
                      ? "border-tone-line shadow-[0_20px_44px_-28px_var(--tone)]"
                      : "border-line hover:border-tone-line hover:shadow-[0_20px_44px_-30px_var(--tone)]",
            )}
        >
            <div className="relative aspect-[4/5] overflow-hidden bg-tone-soft">
                {option.photo ? (
                    <Img
                        src={option.photo}
                        alt={option.name}
                        sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                        maxWidth={640}
                        priority={priority}
                        className="size-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                ) : (
                    <span className="grid size-full place-items-center text-[2.6rem] font-semibold text-tone-text">
                        {initials(option.name)}
                    </span>
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                {place !== undefined && (
                    <span
                        className={cn(
                            "absolute left-2.5 top-2.5 inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full px-2 text-[13px] font-bold tabular-nums shadow-lg sm:left-3 sm:top-3",
                            medal ? "bg-tone text-page" : "bg-black/60 text-white",
                        )}
                    >
                        {crown && <Icon name="trophy" size={13} />}
                        {place}
                        <span className="sr-only">-o&apos;rin</span>
                    </span>
                )}
                {mine && (
                    <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-tone px-2.5 py-1 text-[11.5px] font-semibold text-page shadow-lg sm:right-3 sm:top-3">
                        <Icon name="check" size={12} strokeWidth={3} />
                        Ovozingiz
                    </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-white sm:text-[16.5px]">
                        {option.name}
                    </h3>
                    {where && <p className="mt-0.5 line-clamp-1 text-[12px] text-white/75">{where}</p>}
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
                {reveal && (
                    <div>
                        <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[1.35rem] font-semibold tabular-nums leading-none tracking-tight">
                                <Num value={option.votes ?? 0} />
                                <span className="ml-1 text-[12px] font-normal text-faint">ovoz</span>
                            </span>
                            <span className="text-[12px] tabular-nums text-muted">
                                {total ? option.percent : 0}%
                            </span>
                        </div>
                        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-surface">
                            <motion.span
                                className="block h-full rounded-full bg-tone"
                                initial={false}
                                animate={{ width: `${Math.max(ratio * 100, ratio > 0 ? 3 : 0)}%` }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </span>
                    </div>
                )}

                {option.note && (
                    <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted" title={option.note}>
                        {option.note}
                    </p>
                )}

                {canVote && (
                    <button
                        type="button"
                        onClick={onVote}
                        aria-label={`${option.name} uchun ovoz berish`}
                        className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-invert px-4 py-2.5 text-[13px] font-medium text-on-invert transition-transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Icon name="vote" size={14} />
                        Ovoz berish
                    </button>
                )}
            </div>
        </motion.li>
    );
}
