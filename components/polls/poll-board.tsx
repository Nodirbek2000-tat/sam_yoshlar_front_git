"use client";

import { animate, AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { RichText } from "@/components/rich-text";
import { cn } from "@/lib/cn";
import { foldText, formatNumber, formatShortDate, formatTime } from "@/lib/format";
import type { Poll, PollOption, PollVoteResult } from "@/lib/types";
import { useSessionUser } from "@/lib/use-session-user";

import { Avatar, medalOf, namesList, placeOf, PollPill, qualifies } from "./poll-ui";

const VoteDialog = dynamic(() => import("./vote-dialog"), { ssr: false });

/** Ovoz berish davom etayotganda reyting shuncha vaqtda bir yangilanadi */
const REFRESH_MS = 12_000;

/** Bir martada ko'rsatiladigan nomzodlar */
const PAGE = 30;

/**
 * Raqam o'zgarganda ekrandagi qiymatdan yangisigacha «sanab» boradi.
 *
 * React matnni faqat birinchi marta chizadi (keyin o'zgartirmaydi), qolganini
 * animatsiya yozadi — shunda yangi son bir lahza chiqib, keyin orqaga
 * sakramaydi, yarim yo'lda kelgan yangi son esa ekrandagisidan davom etadi.
 */
function Num({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [first] = useState(value);
    const shown = useRef(value);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element || shown.current === value) return;
        const write = (current: number) => {
            shown.current = current;
            element.textContent = formatNumber(Math.round(current));
        };
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            write(value);
            return;
        }
        const controls = animate(shown.current, value, {
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: write,
            onComplete: () => write(value),
        });
        return () => controls.stop();
    }, [value]);

    return <span ref={ref}>{formatNumber(first)}</span>;
}

/** «2 kun 5 soat», «3 soat 12 daqiqa», «8 daqiqa». */
function remaining(until: string, now: number) {
    const minutes = Math.max(0, Math.floor((new Date(until).getTime() - now) / 60_000));
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const rest = minutes % 60;
    if (days) return `${days} kun${hours ? ` ${hours} soat` : ""}`;
    if (hours) return `${hours} soat${rest ? ` ${rest} daqiqa` : ""}`;
    return `${Math.max(1, rest)} daqiqa`;
}

/** Brauzerdagi joriy vaqt — yarim daqiqada bir yangilanadi (serverda `null`). */
function useNow() {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        const tick = () => setNow(Date.now());
        const first = setTimeout(tick, 0);
        const timer = setInterval(tick, 30_000);
        return () => {
            clearTimeout(first);
            clearInterval(timer);
        };
    }, []);
    return now;
}

export function PollBoard({ initial }: { initial: Poll }) {
    const router = useRouter();
    const { user, ready } = useSessionUser();
    const [poll, setPoll] = useState<Poll>(initial);
    const [query, setQuery] = useState("");
    const [district, setDistrict] = useState("");
    const [limit, setLimit] = useState(PAGE);
    const [target, setTarget] = useState<PollOption | null>(null);
    const now = useNow();
    // Har bir so'rovning tartib raqami: kech kelgan eski javob yangisini bosib ketmasin
    const sequence = useRef(0);

    const reveal = poll.show_results;
    const total = poll.total_votes ?? 0;
    const min = poll.podium_min_votes ?? 1000;
    const myVote = poll.my_vote ?? null;
    const chosen = poll.options.find((option) => option.id === myVote) ?? null;
    const leaderVotes = poll.options[0]?.votes || 1;
    const path = `/sorovnomalar/${poll.slug}`;
    // Teng ovoz bilan 1-o'rinda bir nechta nomzod bo'lishi mumkin
    const winners = reveal
        ? poll.options.filter((option) => option.rank === 1 && qualifies(option, min))
        : [];

    const refresh = useCallback(() => {
        const id = ++sequence.current;
        fetch(`/api/proxy/polls/${initial.slug}`, { cache: "no-store" })
            .then((response) => (response.ok ? (response.json() as Promise<Poll>) : null))
            .then((data) => {
                if (!data || id !== sequence.current) return;
                // Ovoz qaytarib olinmaydi — eski javob «ovoz bermagan» holatga qaytarmasin
                setPoll((previous) =>
                    previous.my_vote && !data.my_vote
                        ? { ...data, my_vote: previous.my_vote }
                        : data,
                );
            })
            // Tarmoq uzilsa — eski ma'lumot qoladi, keyingi safar yana urinadi
            .catch(() => null);
    }, [initial.slug]);

    // Ochilganda — kim ovoz bergani va eng yangi sonlar; keyin jonli yangilanib turadi
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

    const districts = useMemo(() => {
        const seen = new Map<string, string>();
        for (const option of poll.options) {
            if (option.district) seen.set(option.district, option.district_display);
        }
        return [...seen].sort((a, b) => a[1].localeCompare(b[1]));
    }, [poll.options]);

    // Qidiruv kaliti oldindan: o', o‘, oʻ va tutuqsiz yozilgani ham topiladi
    const searchIndex = useMemo(
        () =>
            poll.options.map(
                (option) => [option, foldText(`${option.name} ${option.mahalla}`)] as const,
            ),
        [poll.options],
    );

    const visible = useMemo(() => {
        const text = foldText(query);
        return searchIndex
            .filter(
                ([option, key]) =>
                    (!district || option.district === district) && (!text || key.includes(text)),
            )
            .map(([option]) => option);
    }, [searchIndex, query, district]);

    function startVote(option: PollOption) {
        if (!poll.is_open || myVote) return;
        if (ready && !user) {
            router.push(`/kirish?next=${encodeURIComponent(path)}`);
            return;
        }
        setTarget(option);
    }

    function onVoted(result: PollVoteResult) {
        // Yo'ldagi eski yangilanish javoblari endi hisobga olinmaydi
        sequence.current += 1;
        setPoll(result);
    }

    // Yakunlangan va hech kim chegaraga yetmagan bo'lsa — bo'sh zinapoya ko'rsatilmaydi
    const showPodium = reveal && poll.options.length > 0 && !(poll.is_closed && !winners.length);

    return (
        <>
            {/* ------------------------------------------------ Sarlavha */}
            <section className="tone-amber relative overflow-hidden border-b border-line">
                <div className="aurora" />
                <div className="grid-lines absolute inset-0 opacity-[0.3] [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]" />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-40 -top-40 size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_20%,transparent),transparent_68%)]"
                />

                <div className="container-page relative grid gap-10 py-10 md:py-14 lg:grid-cols-[1.15fr_1fr] lg:items-center">
                    <div>
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
                                {reveal ? <Num value={total} /> : "—"}
                            </HeroStat>
                            <HeroStat label="Nomzodlar">
                                {formatNumber(poll.options_count)}
                            </HeroStat>
                            <HeroStat label={poll.is_closed ? "Holat" : "Qolgan vaqt"}>
                                {poll.is_closed ? (
                                    <span className="text-[15px]">Tugagan</span>
                                ) : poll.ends_at ? (
                                    <span
                                        className="text-[15px]"
                                        title={`${formatShortDate(poll.ends_at)}, ${formatTime(poll.ends_at)}`}
                                    >
                                        {now
                                            ? remaining(poll.ends_at, now)
                                            : formatShortDate(poll.ends_at)}
                                    </span>
                                ) : (
                                    <span className="text-[15px]">Ochiq</span>
                                )}
                            </HeroStat>
                        </dl>

                        <div className="mt-7 flex flex-wrap items-center gap-2.5">
                            {poll.is_open && !myVote && (
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

                    {showPodium ? (
                        <Podium
                            options={poll.options.slice(0, 3)}
                            min={min}
                            closed={poll.is_closed}
                        />
                    ) : poll.image ? (
                        <div className="relative overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]">
                            <Img
                                src={poll.image}
                                sizes="(min-width: 1024px) 520px, 100vw"
                                maxWidth={1080}
                                priority
                                className="aspect-[4/3] size-full object-cover"
                            />
                        </div>
                    ) : null}
                </div>
            </section>

            {/* ------------------------------------------------ Holat */}
            <div className="container-page mt-6">
                <AnimatePresence mode="wait">
                    {poll.is_closed ? (
                        <motion.div
                            key="closed"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-[14px] text-muted sm:p-5"
                        >
                            <Icon name="trophy" size={18} className="mt-0.5 shrink-0 text-text" />
                            <div className="min-w-0">
                                <p>
                                    {winners.length === 1 ? (
                                        <>
                                            Ovoz berish yakunlandi. G&apos;olib —{" "}
                                            <b className="text-text">{winners[0].name}</b> (
                                            {formatNumber(winners[0].votes ?? 0)} ovoz).
                                        </>
                                    ) : winners.length > 1 ? (
                                        <>
                                            Ovoz berish yakunlandi. G&apos;oliblar (teng ovoz bilan)
                                            — <b className="text-text">{namesList(winners)}</b> (
                                            {formatNumber(winners[0].votes ?? 0)} tadan ovoz).
                                        </>
                                    ) : reveal && min > 1 && total > 0 ? (
                                        `Ovoz berish yakunlandi. Hech bir nomzod ${formatNumber(min)} ovozga yetmadi.`
                                    ) : (
                                        "Ovoz berish yakunlandi."
                                    )}
                                </p>
                                {chosen && (
                                    <p className="mt-1 text-[13px] text-faint">
                                        Siz <b className="font-medium text-muted">{chosen.name}</b>
                                        ga ovoz bergansiz — rahmat!
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    ) : chosen ? (
                        <motion.div
                            key="voted"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="tone-emerald flex flex-col gap-4 rounded-2xl border border-tone-line bg-tone-soft p-4 sm:flex-row sm:items-center sm:p-5"
                        >
                            <Avatar option={chosen} size={48} className="rounded-2xl" />
                            <div className="min-w-0 flex-1">
                                <p className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-tone-text">
                                    <Icon name="check" size={13} />
                                    Siz ovoz bergansiz
                                </p>
                                <p className="mt-0.5 truncate text-[16px] font-semibold">
                                    {chosen.name}
                                </p>
                                <p className="text-[12.5px] text-muted">
                                    {!reveal
                                        ? "Natijalar keyinroq e'lon qilinadi"
                                        : qualifies(chosen, min) && chosen.rank
                                          ? `Hozir ${chosen.rank}-o'rinda · ${formatNumber(chosen.votes ?? 0)} ovoz`
                                          : `${formatNumber(chosen.votes ?? 0)} ovoz · zinapoyaga ${formatNumber(Math.max(min, 1))} ovozdan chiqadi`}
                                </p>
                            </div>
                            <ShareButton
                                title={`${poll.title} — men ${chosen.name}ga ovoz berdim. Siz ham qo'llab-quvvatlang!`}
                                path={path}
                                label="Do'stlarni taklif qilish"
                            />
                        </motion.div>
                    ) : ready && !user ? (
                        <motion.div
                            key="guest"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-4 rounded-2xl border border-line bg-raised p-4 sm:flex-row sm:items-center sm:p-5"
                        >
                            <span className="tone-blue grid size-11 shrink-0 place-items-center rounded-xl bg-tone-soft text-tone-text">
                                <Icon name="telegram" size={20} />
                            </span>
                            <div className="flex-1">
                                <p className="text-[15px] font-medium">Ovoz berish uchun kiring</p>
                                <p className="mt-0.5 text-[13px] text-muted">
                                    Telegram orqali bir bosishda. Har kim faqat bir marta ovoz
                                    beradi — shuning uchun natija halol.
                                </p>
                            </div>
                            <Link
                                href={`/kirish?next=${encodeURIComponent(path)}`}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert"
                            >
                                Kirish
                                <Icon name="arrowRight" size={14} />
                            </Link>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* ------------------------------------------------ Reyting */}
            <section id="nomzodlar" className="container-page scroll-mt-24 py-10 md:py-12">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-[1.6rem] font-semibold tracking-tight">
                            {reveal ? "Reyting" : "Nomzodlar"}
                        </h2>
                        <p className="mt-1 text-[13.5px] text-muted">
                            {reveal
                                ? poll.is_open
                                    ? "Har bir ovoz bilan o'rinlar o'zgaradi — sahifa o'zi yangilanib turadi."
                                    : "Yakuniy natijalar."
                                : "Natijalar keyinroq e'lon qilinadi."}
                        </p>
                    </div>
                    {reveal && poll.is_open && (
                        <span className="tone-emerald inline-flex items-center gap-2 text-[12px] font-medium text-tone-text">
                            <span className="poll-live relative size-1.5 rounded-full bg-tone" />
                            Jonli
                        </span>
                    )}
                </div>

                {poll.options.length > 8 && (
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
                    <ol className="mt-6 space-y-2.5">
                        {visible.slice(0, limit).map((option, index) => (
                            <OptionRow
                                key={option.id}
                                option={option}
                                // Ovozi yo'q nomzodlarga o'rin raqami berilmaydi (hammasi «1» bo'lib qolmasin)
                                place={
                                    reveal
                                        ? (option.votes ?? 0) > 0
                                            ? option.rank
                                            : undefined
                                        : index + 1
                                }
                                reveal={reveal}
                                total={total}
                                min={min}
                                ratio={(option.votes ?? 0) / leaderVotes}
                                mine={option.id === myVote}
                                canVote={poll.is_open && !myVote}
                                onVote={() => startVote(option)}
                            />
                        ))}
                    </ol>
                ) : (
                    <p className="mt-6 rounded-2xl border border-dashed border-line py-14 text-center text-[14px] text-muted">
                        Bu bo&apos;yicha nomzod topilmadi.
                    </p>
                )}

                {visible.length > limit && (
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setLimit((value) => value + PAGE)}
                            className="rounded-full border border-line bg-raised px-6 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-surface"
                        >
                            Yana ko&apos;rsatish ({visible.length - limit})
                        </button>
                    </div>
                )}
            </section>

            {target && (
                <VoteDialog
                    slug={poll.slug}
                    option={target}
                    reveal={reveal}
                    min={min}
                    title={poll.title}
                    path={path}
                    onClose={() => setTarget(null)}
                    onVoted={onVoted}
                    onConflict={refresh}
                />
            )}
        </>
    );
}

function HeroStat({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="rounded-2xl border border-line bg-page/70 px-3.5 py-3 backdrop-blur">
            <dt className="text-[11.5px] text-faint">{label}</dt>
            <dd className="mt-1 text-[1.35rem] font-semibold tabular-nums leading-tight tracking-tight">
                {children}
            </dd>
        </div>
    );
}

/**
 * Peshqadam uchtalik: o'rtada 1-o'rin, chapda 2-, o'ngda 3-.
 *
 * Zinapoyaga faqat kamida `min` ovoz to'plagan nomzod chiqadi — 100 ta ovoz
 * bilan «1-o'rin» bo'lib ko'rinib qolmasin. Yetmagan o'rin bo'sh turadi;
 * nomzodning o'zi yo'q o'rin (2 nomzodli so'rovnomada 3-o'rin) umuman chizilmaydi.
 */
function Podium({ options, min, closed }: { options: PollOption[]; min: number; closed: boolean }) {
    const places = [2, 1, 3];
    const heights = ["h-24 sm:h-28", "h-32 sm:h-40", "h-16 sm:h-20"];
    // undefined — bunday o'rin yo'q; null — nomzod bor, lekin chegaraga yetmagan
    const slots = places.map((place) => {
        if (place > options.length) return undefined;
        const option = options[place - 1];
        return qualifies(option, min) ? option : null;
    });
    const waiting = slots.some((slot) => slot === null);
    const need = formatNumber(Math.max(min, 1));

    return (
        <div className="relative rounded-[2rem] border border-line bg-page/70 p-5 pb-0 shadow-[0_30px_70px_-40px_var(--tone)] backdrop-blur sm:p-7 sm:pb-0">
            <p className="text-center text-[12px] font-medium uppercase tracking-[0.14em] text-faint">
                {closed ? "G'oliblar" : "Peshqadamlar"}
            </p>
            {waiting && !closed && (
                <p className="mx-auto mt-1.5 max-w-xs text-center text-[12px] leading-snug text-faint">
                    Zinapoyaga kamida {need} ovoz to&apos;plagan nomzodlar chiqadi
                </p>
            )}
            <div className="mt-6 grid grid-cols-3 items-end gap-2.5 sm:gap-4">
                {slots.map((option, column) => {
                    if (option === undefined) return <div key={`none-${column}`} aria-hidden />;

                    const first = column === 1;
                    const size = first ? 84 : 64;
                    const medal = option ? (medalOf(option, min) ?? "tone-slate") : "tone-slate";

                    return (
                        <motion.div
                            key={option ? option.id : `slot-${column}`}
                            layout
                            className={cn(medal, "flex min-w-0 flex-col items-center text-center")}
                        >
                            {option ? (
                                <>
                                    <div className="relative">
                                        {first && (
                                            <span className="absolute -top-4 left-1/2 z-10 grid size-8 -translate-x-1/2 place-items-center rounded-full bg-tone text-page shadow-lg">
                                                <Icon name="trophy" size={15} />
                                            </span>
                                        )}
                                        {/* Halqa medal rangida — suratning o'z rangida emas */}
                                        <span className="block rounded-full ring-4 ring-tone/60">
                                            <Avatar option={option} size={size} className="rounded-full" />
                                        </span>
                                    </div>
                                    <p
                                        title={option.name}
                                        className="mt-3 line-clamp-2 w-full break-words text-[13px] font-semibold leading-tight sm:text-[14px]"
                                    >
                                        {option.name}
                                    </p>
                                    <p className="mt-1 text-[12px] tabular-nums text-muted">
                                        <Num value={option.votes ?? 0} /> · {option.percent}%
                                    </p>
                                </>
                            ) : (
                                <>
                                    <span
                                        className="grid place-items-center rounded-full border-2 border-dashed border-line text-faint"
                                        style={{ width: size, height: size }}
                                    >
                                        <Icon name="user" size={first ? 26 : 20} />
                                    </span>
                                    <p className="mt-3 text-[13px] font-medium leading-tight text-muted">
                                        Bo&apos;sh o&apos;rin
                                    </p>
                                    <p className="mt-1 text-[12px] tabular-nums text-faint">
                                        {closed ? "—" : `${need}+ ovoz`}
                                    </p>
                                </>
                            )}

                            {/* Ko'tarilish CSS'da — JS yuklanmasdan ham ko'rinadi */}
                            <div
                                aria-hidden
                                className={cn(
                                    heights[column],
                                    "podium-step mt-3 grid w-full place-items-start justify-center rounded-t-2xl border border-b-0 pt-2 text-[1.75rem] font-bold sm:text-[2.25rem]",
                                    option
                                        ? "border-tone-line bg-gradient-to-b from-tone/35 to-tone/5 text-tone-text"
                                        : "border-dashed border-line bg-surface/40 text-faint/60",
                                )}
                                style={{ animationDelay: `${0.15 + column * 0.1}s` }}
                            >
                                {option?.rank ?? places[column]}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

function OptionRow({
    option,
    place,
    reveal,
    total,
    min,
    ratio,
    mine,
    canVote,
    onVote,
}: {
    option: PollOption;
    /** O'rin raqami; `undefined` — hali ovozi yo'q */
    place: number | undefined;
    reveal: boolean;
    total: number;
    /** Medal shu ovozdan boshlab beriladi */
    min: number;
    ratio: number;
    mine: boolean;
    canVote: boolean;
    onVote: () => void;
}) {
    const medal = reveal ? medalOf(option, min) : null;
    const where = placeOf(option);
    const hasActions = reveal || mine || canVote;

    return (
        <motion.li
            layout="position"
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className={cn(
                medal ?? (mine ? "tone-emerald" : "tone-blue"),
                "group relative overflow-hidden rounded-2xl border bg-raised transition-colors",
                mine
                    ? "border-tone-line ring-2 ring-tone/40"
                    : "border-line hover:border-tone-line",
            )}
        >
            {/* Ovozlar ulushi — qatorning o'zi «chiziq» bo'lib to'ladi */}
            {reveal && total > 0 && (
                <motion.span
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-tone-soft"
                    initial={false}
                    animate={{ width: `${Math.max(ratio * 100, ratio > 0 ? 2 : 0)}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
            )}

            <div className="relative flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4 sm:p-4">
                <span
                    className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full text-[13px] font-bold tabular-nums",
                        medal ? "bg-tone text-page shadow-sm" : "bg-surface text-muted",
                    )}
                >
                    {reveal ? (place ?? "–") : "•"}
                    {reveal && place !== undefined && <span className="sr-only">-o&apos;rin</span>}
                </span>

                <Avatar option={option} size={52} className="rounded-2xl" />

                <div className="min-w-0 flex-1">
                    <p
                        className="truncate text-[15px] font-semibold leading-snug"
                        title={option.name}
                    >
                        {option.name}
                    </p>
                    {where && <p className="mt-0.5 truncate text-[12.5px] text-muted">{where}</p>}
                    {option.note && (
                        <p className="mt-0.5 hidden truncate text-[12px] text-faint sm:block">
                            {option.note}
                        </p>
                    )}
                </div>

                {/* Telefonda doim alohida qatorda — ism siqilib qolmasin */}
                {hasActions && (
                    <div className="flex w-full shrink-0 items-center justify-end gap-3 sm:ml-auto sm:w-auto sm:gap-4">
                        {reveal && (
                            <div className="text-right">
                                <p className="text-[18px] font-semibold tabular-nums leading-none">
                                    <Num value={option.votes ?? 0} />
                                </p>
                                <p className="mt-1 text-[11.5px] tabular-nums text-faint">
                                    {option.percent}% · ovoz
                                </p>
                            </div>
                        )}

                        {mine ? (
                            <span className="tone-emerald inline-flex items-center gap-1.5 rounded-full bg-tone px-3.5 py-2 text-[12.5px] font-medium text-page">
                                <Icon name="check" size={14} />
                                Sizning ovozingiz
                            </span>
                        ) : canVote ? (
                            <button
                                type="button"
                                onClick={onVote}
                                aria-label={`${option.name} uchun ovoz berish`}
                                className="inline-flex items-center gap-1.5 rounded-full bg-invert px-4 py-2 text-[13px] font-medium text-on-invert transition-transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Icon name="vote" size={14} />
                                Ovoz berish
                            </button>
                        ) : null}
                    </div>
                )}
            </div>
        </motion.li>
    );
}

/** Telegram'da ulashish (telefonda — tizimning o'z ulashish oynasi). */
function ShareButton({
    title,
    path,
    label = "Ulashish",
}: {
    title: string;
    path: string;
    label?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function share() {
        const url = `${window.location.origin}${path}`;
        if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
            try {
                await navigator.share({ title, url });
            } catch {
                // Bekor qilindi — hech narsa qilmaymiz
            }
            return;
        }
        window.open(
            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            "_blank",
            "noopener,noreferrer",
        );
        navigator.clipboard?.writeText(url).then(
            () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            },
            () => null,
        );
    }

    return (
        <button
            type="button"
            onClick={share}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-line bg-page/80 px-5 py-2.5 text-[13.5px] font-medium backdrop-blur transition-colors hover:bg-surface"
        >
            <Icon name={copied ? "check" : "send"} size={15} />
            {copied ? "Havola nusxalandi" : label}
        </button>
    );
}
