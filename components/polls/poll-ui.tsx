import Link from "next/link";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { cn } from "@/lib/cn";
import { formatNumber, formatShortDate } from "@/lib/format";
import { toneClass } from "@/lib/tone";
import type { Poll, PollOption } from "@/lib/types";

/**
 * So'rovnomaning umumiy bo'laklari — ro'yxat kartasi, nomzod surati,
 * medal ranglari. Ham serverda, ham brauzerda ishlaydi.
 */

/** 1-, 2-, 3-o'rin: oltin, kumush, bronza */
export const MEDALS = ["tone-amber", "tone-slate", "tone-orange"] as const;

/** Kamida `min` ovoz to'plaganmi — faqat shunda 1-2-3 o'rin bo'lib ko'rinadi. */
export const qualifies = (option: Pick<PollOption, "votes"> | undefined, min: number) =>
    Boolean(option && (option.votes ?? 0) > 0 && (option.votes ?? 0) >= min);

/** Oltin/kumush/bronza — 1-3 o'rinda va eng kam ovoz chegarasidan o'tgan bo'lsa. */
export const medalOf = (option: Pick<PollOption, "rank" | "votes">, min: number) =>
    option.rank && option.rank <= 3 && qualifies(option, min) ? MEDALS[option.rank - 1] : null;

export const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

/** «A», «A va B», «A, B va C». */
export function namesList(options: Pick<PollOption, "name">[]) {
    const names = options.map((option) => option.name);
    return names.length > 1
        ? `${names.slice(0, -1).join(", ")} va ${names.at(-1)}`
        : (names[0] ?? "");
}

/** «Navbahor mahallasi · Urgut tumani» */
export function placeOf(option: PollOption) {
    const mahalla = option.mahalla
        ? /mahalla/i.test(option.mahalla)
            ? option.mahalla
            : `${option.mahalla} mahallasi`
        : "";
    return [mahalla, option.district_display].filter(Boolean).join(" · ");
}

export function Avatar({
    option,
    size = 48,
    className,
}: {
    option: Pick<PollOption, "name" | "photo">;
    size?: number;
    className?: string;
}) {
    return (
        <span
            className={cn(
                toneClass(option.name),
                "grid shrink-0 place-items-center overflow-hidden bg-tone-soft font-semibold text-tone-text",
                className,
            )}
            style={{ width: size, height: size, fontSize: Math.max(11, size * 0.32) }}
        >
            {option.photo ? (
                <Img
                    src={option.photo}
                    sizes={`${size}px`}
                    maxWidth={size > 96 ? 640 : 256}
                    className="size-full object-cover"
                />
            ) : (
                initials(option.name)
            )}
        </span>
    );
}

/** Holat yorlig'i: jonli / yakunlangan. */
export function PollPill({
    poll,
    className,
}: {
    poll: Pick<Poll, "is_closed">;
    className?: string;
}) {
    return poll.is_closed ? (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-line bg-page/80 px-3 py-1 text-[11.5px] font-medium text-muted backdrop-blur",
                className,
            )}
        >
            <Icon name="check" size={12} />
            Yakunlangan
        </span>
    ) : (
        <span
            className={cn(
                "tone-emerald inline-flex items-center gap-2 rounded-full border border-tone-line bg-page/80 px-3 py-1 text-[11.5px] font-medium text-tone-text backdrop-blur",
                className,
            )}
        >
            <span className="poll-live relative size-1.5 rounded-full bg-tone" />
            Ovoz berish davom etmoqda
        </span>
    );
}

/** Ro'yxatdagi karta: muqova, peshqadam uchtalik, ovoz berish tugmasi. */
export function PollCard({ poll }: { poll: Poll }) {
    const min = poll.podium_min_votes ?? 1000;
    // Peshqadamlar — faqat chegaradan o'tganlar (kam ovoz bilan «1-o'rin» chiqmasin)
    const leaders = poll.show_results
        ? poll.options.filter((option) => qualifies(option, min))
        : [];
    const max = leaders[0]?.votes || 1;

    return (
        <Link
            href={`/sorovnomalar/${poll.slug}`}
            className="tone-amber group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-tone-line hover:shadow-[0_18px_40px_-22px_var(--tone)]"
        >
            <div className="relative aspect-[16/9] overflow-hidden border-b border-line bg-tone-soft lg:aspect-[16/7]">
                {poll.image ? (
                    <Img
                        src={poll.image}
                        sizes="(min-width: 1024px) 560px, 100vw"
                        maxWidth={1080}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                ) : (
                    <PollArt options={leaders} />
                )}
                <PollPill poll={poll} className="absolute left-4 top-4" />
            </div>

            <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2 className="text-[18px] font-semibold leading-snug tracking-tight">
                    {poll.title}
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-faint">
                    <span className="inline-flex items-center gap-1.5">
                        <Icon name="users" size={13} />
                        {poll.options_count} nomzod
                    </span>
                    {poll.total_votes !== null && (
                        <span className="inline-flex items-center gap-1.5 font-medium text-muted">
                            <Icon name="vote" size={13} />
                            {formatNumber(poll.total_votes)} ovoz
                        </span>
                    )}
                    {poll.ends_at && !poll.is_closed && (
                        <span className="inline-flex items-center gap-1.5">
                            <Icon name="clock" size={13} />
                            {formatShortDate(poll.ends_at)} gacha
                        </span>
                    )}
                </p>

                {leaders.length ? (
                    <ol className="mt-5 space-y-3">
                        {leaders.map((option) => {
                            const medal = medalOf(option, min);
                            return (
                                <li key={option.id} className="flex items-center gap-3">
                                    <span
                                        className={cn(
                                            medal ?? "tone-slate",
                                            "grid size-6 shrink-0 place-items-center rounded-full bg-tone-soft text-[11px] font-bold text-tone-text",
                                        )}
                                    >
                                        {option.rank}
                                    </span>
                                    <Avatar option={option} size={36} className="rounded-xl" />
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-baseline justify-between gap-2">
                                            <span className="truncate text-[13.5px] font-medium">
                                                {option.name}
                                            </span>
                                            <span className="shrink-0 text-[12px] tabular-nums text-muted">
                                                {option.percent}%
                                            </span>
                                        </span>
                                        <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface">
                                            <span
                                                className={cn(
                                                    medal ?? "tone-slate",
                                                    "block h-full rounded-full bg-tone",
                                                )}
                                                style={{
                                                    width: `${((option.votes ?? 0) / max) * 100}%`,
                                                }}
                                            />
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                ) : (
                    <div className="mt-5 flex items-center">
                        {poll.options.map((option, index) => (
                            <Avatar
                                key={option.id}
                                option={option}
                                size={40}
                                className={cn(
                                    "rounded-full ring-2 ring-raised",
                                    index && "-ml-2.5",
                                )}
                            />
                        ))}
                        {poll.options_count > poll.options.length && (
                            <span className="-ml-2.5 grid size-10 place-items-center rounded-full bg-surface text-[12px] font-medium text-muted ring-2 ring-raised">
                                +{poll.options_count - poll.options.length}
                            </span>
                        )}
                        {poll.show_results && min > 1 && (
                            <span className="ml-3 text-[12px] leading-snug text-faint">
                                {poll.is_closed ? (
                                    <>
                                        Hech bir nomzod
                                        <br />
                                        {formatNumber(min)} ovozga yetmadi
                                    </>
                                ) : (
                                    <>
                                        Peshqadamlar {formatNumber(min)} ovozdan
                                        <br />
                                        keyin aniqlanadi
                                    </>
                                )}
                            </span>
                        )}
                    </div>
                )}

                <span className="mt-6 inline-flex items-center gap-1.5 pt-1 text-[13px] font-medium text-tone-text">
                    {poll.is_open ? "Ovoz berish" : "Natijalarni ko'rish"}
                    <Icon
                        name="arrowRight"
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </span>
            </div>
        </Link>
    );
}

/**
 * Muqova rasmi bo'lmasa — zinapoya ko'rinishidagi bezak. Faqat chegaradan
 * o'tgan peshqadamlar suratda chiqadi, qolgan o'rinlar bo'sh turadi.
 */
export function PollArt({ options }: { options: PollOption[] }) {
    return (
        <div className="absolute inset-0">
            <div className="grid-lines absolute inset-0 opacity-40 [mask-image:radial-gradient(70%_80%_at_50%_50%,#000,transparent)]" />
            <div className="absolute -bottom-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_35%,transparent),transparent_70%)]" />
            <div className="absolute inset-0 flex items-end justify-center">
                <div className="flex items-end gap-3">
                    {[1, 0, 2].map((index) => {
                        const option = options[index];
                        const tall = index === 0;
                        return (
                            <span key={index} className="flex flex-col items-center gap-2">
                                {option ? (
                                    <Avatar
                                        option={option}
                                        size={tall ? 56 : 44}
                                        className="rounded-full ring-4 ring-page/70"
                                    />
                                ) : (
                                    <span
                                        className="grid place-items-center rounded-full bg-page/60 text-tone-text"
                                        style={{ width: tall ? 56 : 44, height: tall ? 56 : 44 }}
                                    >
                                        <Icon name="user" size={18} />
                                    </span>
                                )}
                                <span
                                    className={cn(
                                        "w-14 rounded-t-xl bg-gradient-to-b from-tone/45 to-tone/5",
                                        tall ? "h-14" : index === 1 ? "h-10" : "h-7",
                                    )}
                                />
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/** E'lonlar sahifasining tepasidagi keng banner — faol so'rovnomaga chorlaydi. */
export function PollBanner({ poll }: { poll: Poll }) {
    const min = poll.podium_min_votes ?? 1000;
    // 1-o'rinni teng ovoz bilan bir nechta nomzod bo'lishishi mumkin
    const leaders = poll.show_results
        ? poll.options.filter((option) => option.rank === 1 && qualifies(option, min))
        : [];

    return (
        <Link
            href={`/sorovnomalar/${poll.slug}`}
            className="tone-amber group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-tone-line bg-raised p-5 transition-shadow duration-300 hover:shadow-[0_20px_44px_-24px_var(--tone)] md:flex-row md:items-center md:gap-6 md:p-6"
        >
            <span
                aria-hidden
                className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_22%,transparent),transparent_70%)]"
            />

            <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-tone text-page shadow-[0_10px_24px_-10px_var(--tone)]">
                <Icon name="vote" size={26} />
            </span>

            <div className="relative min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11.5px] font-medium uppercase tracking-[0.12em] text-tone-text">
                        So&apos;rovnoma
                    </span>
                    <PollPill poll={poll} />
                </div>
                <h2 className="mt-2 text-[18px] font-semibold leading-snug tracking-tight md:text-[20px]">
                    {poll.title}
                </h2>
                <p className="mt-1.5 text-[13px] text-muted">
                    {poll.options_count} nomzod
                    {poll.total_votes !== null && ` · ${formatNumber(poll.total_votes)} ovoz`}
                    {leaders.length > 0 && (
                        <>
                            {" "}
                            · {poll.is_closed ? "G'olib" : "Yetakchi"}
                            {leaders.length > 1 && "lar"}:{" "}
                            <b className="font-medium text-text">{namesList(leaders)}</b>
                        </>
                    )}
                </p>
            </div>

            <div className="relative flex shrink-0 items-center gap-4">
                <span className="hidden items-center sm:flex">
                    {poll.options.map((option, index) => (
                        <Avatar
                            key={option.id}
                            option={option}
                            size={38}
                            className={cn("rounded-full ring-2 ring-raised", index && "-ml-2.5")}
                        />
                    ))}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-invert px-4 py-2.5 text-[13.5px] font-medium text-on-invert">
                    {poll.is_open ? "Ovoz berish" : "Natijalar"}
                    <Icon
                        name="arrowRight"
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </span>
            </div>
        </Link>
    );
}
