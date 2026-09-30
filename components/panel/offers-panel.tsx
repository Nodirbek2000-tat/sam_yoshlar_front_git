"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Icon, type IconName } from "@/components/icon";
import { EmptyState, Flash, INPUT, PanelHeader } from "@/components/panel/ui";
import { UserDrawer } from "@/components/panel/user-drawer";
import { cn } from "@/lib/cn";
import { formatNumber, formatShortDate } from "@/lib/format";
import type { OfferPerson, OfferStatus, ReceivedOffer } from "@/lib/types";

/**
 * Panel: investitsiya takliflari.
 *
 * Kim qaysi startapga taklif yubordi, asoschi qabul qildimi va suhbat
 * natijasi haqida nima dedi. Ismga bosilsa — o'sha odamning hisobi ochiladi.
 */

export type PanelOffer = ReceivedOffer & {
    /** Startap egasi (hisobi bo'lsa) */
    owner: OfferPerson | null;
    owner_name: string;
};

export type OfferStats = {
    total: number;
    new: number;
    accepted: number;
    declined: number;
    feedback: number;
    waiting_feedback: number;
    deals: number;
    talking: number;
    no_deal: number;
    investors: number;
    startups: number;
};

export type OfferFilters = { holat?: string; fikr?: string; natija?: string; q?: string };

const STATUS_TONE: Record<OfferStatus, string> = {
    new: "tone-amber",
    accepted: "tone-emerald",
    declined: "tone-slate",
};

const OUTCOME_TONE: Record<string, string> = {
    deal: "tone-emerald",
    talking: "tone-amber",
    no_deal: "tone-rose",
};

function href(filters: OfferFilters, page?: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
        if (value) params.set(key, value);
    }
    if (page && page > 1) params.set("sahifa", String(page));
    const query = params.toString();
    return `/nazorat/investitsiya${query ? `?${query}` : ""}`;
}

export function OffersPanel({
    offers,
    stats,
    count,
    page,
    pages,
    filters,
}: {
    offers: PanelOffer[];
    stats: OfferStats;
    count: number;
    page: number;
    pages: number;
    filters: OfferFilters;
}) {
    const router = useRouter();
    const [query, setQuery] = useState(filters.q ?? "");
    const [busyId, setBusyId] = useState<number | null>(null);
    const [flash, setFlash] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);

    const filtered = Boolean(filters.holat || filters.fikr || filters.natija || filters.q);

    /** Bitta filtrni almashtiradi; qayta bosilsa — olib tashlaydi. */
    const toggle = (key: keyof OfferFilters, value: string) =>
        href({ ...filters, [key]: filters[key] === value ? undefined : value });

    function search(event: FormEvent) {
        event.preventDefault();
        router.push(href({ ...filters, q: query.trim() || undefined }), { scroll: false });
    }

    async function remove(offer: PanelOffer) {
        if (!confirm(`${offer.full_name} → «${offer.startup.name}» taklifi o'chirilsinmi?`)) return;

        setBusyId(offer.id);
        try {
            const response = await fetch(`/api/proxy/panel/investitsiya/${offer.id}`, {
                method: "DELETE",
            });
            setFlash(response.ok ? "Taklif o'chirildi." : "O'chirib bo'lmadi.");
            if (response.ok) router.refresh();
        } finally {
            setBusyId(null);
        }
    }

    const cards: { label: string; value: number; icon: IconName; tone: string; to: string }[] = [
        { label: "Jami takliflar", value: stats.total, icon: "bank", tone: "tone-blue", to: href({}) },
        {
            label: "Javob kutilmoqda",
            value: stats.new,
            icon: "clock",
            tone: "tone-amber",
            to: href({ holat: "new" }),
        },
        {
            label: "Qabul qilingan",
            value: stats.accepted,
            icon: "check",
            tone: "tone-emerald",
            to: href({ holat: "accepted" }),
        },
        {
            label: "Fikr bildirilgan",
            value: stats.feedback,
            icon: "chat",
            tone: "tone-violet",
            to: href({ fikr: "bor" }),
        },
        {
            label: "Kelishilgan",
            value: stats.deals,
            icon: "trophy",
            tone: "tone-emerald",
            to: href({ natija: "deal" }),
        },
    ];

    return (
        <>
            <PanelHeader
                title="Investitsiya takliflari"
                description="Kim qaysi startapga taklif yubordi, asoschi qabul qildimi va suhbat qanday yakunlandi."
            />

            <Flash text={flash} onDone={() => setFlash(null)} />

            {/* --- Raqamlar: bosilsa o'sha bo'yicha saralanadi --- */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        href={card.to}
                        scroll={false}
                        className={cn(
                            card.tone,
                            "rounded-2xl border border-line bg-raised p-4 transition-colors hover:border-tone-line",
                        )}
                    >
                        <span className="grid size-8 place-items-center rounded-lg bg-tone-soft text-tone-text">
                            <Icon name={card.icon} size={15} />
                        </span>
                        <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
                            {formatNumber(card.value)}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-muted">{card.label}</p>
                    </Link>
                ))}
            </div>

            <p className="mt-3 text-[12.5px] text-faint">
                {formatNumber(stats.investors)} ta investor · {formatNumber(stats.startups)} ta startap ·{" "}
                {formatNumber(stats.waiting_feedback)} ta asoschidan fikr kutilmoqda ·{" "}
                {formatNumber(stats.declined)} ta rad etilgan
            </p>

            {/* --- Filtrlar --- */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <form onSubmit={search} className="relative w-full max-w-xs">
                    <Icon
                        name="search"
                        size={15}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint"
                    />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Startap, ism yoki telefon"
                        className={`${INPUT} pl-10`}
                    />
                </form>

                <div className="-mx-1 flex flex-wrap gap-1.5 px-1">
                    <Chip href={href({ q: filters.q })} active={!filters.holat && !filters.fikr && !filters.natija} label="Barchasi" />
                    <Chip href={toggle("holat", "new")} active={filters.holat === "new"} label="Yangi" tone="tone-amber" />
                    <Chip href={toggle("holat", "accepted")} active={filters.holat === "accepted"} label="Qabul qilingan" tone="tone-emerald" />
                    <Chip href={toggle("holat", "declined")} active={filters.holat === "declined"} label="Rad etilgan" />
                    <span aria-hidden className="mx-1 w-px self-stretch bg-line" />
                    <Chip href={toggle("fikr", "bor")} active={filters.fikr === "bor"} label="Fikr bildirgan" tone="tone-violet" />
                    <Chip href={toggle("fikr", "yoq")} active={filters.fikr === "yoq"} label="Fikr kutilmoqda" tone="tone-amber" />
                    <span aria-hidden className="mx-1 w-px self-stretch bg-line" />
                    <Chip href={toggle("natija", "deal")} active={filters.natija === "deal"} label="Kelishdi" tone="tone-emerald" />
                    <Chip href={toggle("natija", "talking")} active={filters.natija === "talking"} label="Muzokarada" tone="tone-amber" />
                    <Chip href={toggle("natija", "no_deal")} active={filters.natija === "no_deal"} label="Kelishmadi" tone="tone-rose" />
                </div>
            </div>

            {filtered && (
                <p className="mt-3 text-[12.5px] text-muted">
                    Topildi: <b className="font-semibold text-text">{formatNumber(count)}</b> ta
                </p>
            )}

            {offers.length ? (
                <ul className="mt-4 space-y-2.5">
                    {offers.map((offer) => (
                        <li
                            key={offer.id}
                            className={cn(
                                STATUS_TONE[offer.status],
                                "rounded-2xl border border-line bg-raised p-4",
                                busyId === offer.id && "opacity-60",
                            )}
                        >
                            <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
                                {/* Kim yubordi */}
                                <Person
                                    caption="Investor"
                                    name={offer.full_name}
                                    person={offer.investor}
                                    onOpen={setUserId}
                                />

                                <Icon name="arrowRight" size={16} className="mt-4 shrink-0 text-faint" />

                                {/* Kimga */}
                                <div className="min-w-0 flex-1 basis-56">
                                    <p className="text-[11px] uppercase tracking-[0.08em] text-faint">Startap</p>
                                    <a
                                        href={`/startaplar/${offer.startup.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-0.5 inline-flex max-w-full items-center gap-1.5 text-[14.5px] font-medium transition-colors hover:text-accent-text"
                                    >
                                        <Icon name="rocket" size={13} className="shrink-0 text-faint" />
                                        <span className="truncate">{offer.startup.name}</span>
                                    </a>
                                    <p className="mt-0.5 text-[12.5px] text-muted">
                                        Asoschi:{" "}
                                        {offer.owner ? (
                                            <button
                                                type="button"
                                                onClick={() => setUserId(offer.owner!.id)}
                                                className="font-medium text-text underline-offset-4 hover:underline"
                                            >
                                                {offer.owner.full_name || offer.owner_name}
                                            </button>
                                        ) : (
                                            <span>
                                                {offer.owner_name}{" "}
                                                <span className="text-faint">(hisobi yo&apos;q)</span>
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className="ml-auto flex shrink-0 items-center gap-2">
                                    <span className="rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text">
                                        {offer.status_display}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => remove(offer)}
                                        disabled={busyId !== null}
                                        title="Taklifni o'chirish"
                                        aria-label="Taklifni o'chirish"
                                        className="grid size-8 place-items-center rounded-full border border-line text-muted transition-colors hover:border-warn-text hover:bg-warn-soft hover:text-warn-text disabled:opacity-40"
                                    >
                                        <Icon name="trash" size={14} />
                                    </button>
                                </div>
                            </div>

                            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
                                <a href={`tel:${offer.phone}`} className="inline-flex items-center gap-1.5 tabular-nums hover:text-text">
                                    <Icon name="phone" size={12} />
                                    {offer.phone}
                                </a>
                                {offer.telegram && (
                                    <a
                                        href={`https://t.me/${offer.telegram}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 hover:text-text"
                                    >
                                        <Icon name="telegram" size={12} />@{offer.telegram}
                                    </a>
                                )}
                                <span className="text-faint">
                                    Yuborilgan: {formatShortDate(offer.created_at)}
                                </span>
                                {offer.responded_at && (
                                    <span className="text-faint">
                                        Javob: {formatShortDate(offer.responded_at)}
                                    </span>
                                )}
                            </p>

                            {/* Asoschining fikri */}
                            {offer.feedback_at ? (
                                <div
                                    className={cn(
                                        OUTCOME_TONE[offer.outcome] ?? "tone-slate",
                                        "mt-3 rounded-xl border-l-2 border-tone bg-tone-soft px-4 py-3",
                                    )}
                                >
                                    <p className="flex flex-wrap items-center gap-2 text-[12.5px]">
                                        <span className="font-semibold text-tone-text">
                                            {offer.outcome_display}
                                        </span>
                                        <span className="text-faint">
                                            asoschi fikri · {formatShortDate(offer.feedback_at)}
                                        </span>
                                    </p>
                                    {offer.feedback && (
                                        <p className="mt-1.5 whitespace-pre-line text-[13.5px] leading-relaxed">
                                            {offer.feedback}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                offer.status === "accepted" && (
                                    <p className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-faint">
                                        <Icon name="clock" size={12} />
                                        Asoschi hali fikr bildirmagan
                                    </p>
                                )
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="mt-4">
                    <EmptyState
                        text={
                            filtered
                                ? "Bu filtr bo'yicha taklif topilmadi."
                                : "Hozircha hech kim investitsiya taklifi yubormagan."
                        }
                    />
                </div>
            )}

            {pages > 1 && (
                <nav className="mt-6 flex items-center justify-center gap-2 text-[13px]">
                    <PageLink href={href(filters, page - 1)} disabled={page <= 1} label="← Oldingi" />
                    <span className="px-2 tabular-nums text-muted">
                        {page} / {pages}
                    </span>
                    <PageLink href={href(filters, page + 1)} disabled={page >= pages} label="Keyingi →" />
                </nav>
            )}

            <UserDrawer
                userId={userId}
                onClose={() => setUserId(null)}
                onChanged={(message) => {
                    setFlash(message);
                    router.refresh();
                }}
                onDeleted={(message) => {
                    setUserId(null);
                    setFlash(message);
                    router.refresh();
                }}
            />
        </>
    );
}

function Person({
    caption,
    name,
    person,
    onOpen,
}: {
    caption: string;
    name: string;
    person: OfferPerson | null;
    onOpen: (id: number) => void;
}) {
    const initials =
        person?.initials ||
        name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();

    const body = (
        <>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-tone-line bg-tone-soft text-[12px] font-semibold text-tone-text">
                {initials}
            </span>
            <span className="min-w-0 text-left">
                <span className="block text-[11px] uppercase tracking-[0.08em] text-faint">{caption}</span>
                <span className="block truncate text-[14.5px] font-medium">{name}</span>
            </span>
        </>
    );

    // Hisobi bor — bosilsa kartochkasi ochiladi
    return person ? (
        <button
            type="button"
            onClick={() => onOpen(person.id)}
            title="Hisobini ko'rish"
            className="flex min-w-0 basis-56 items-center gap-3 rounded-xl transition-opacity hover:opacity-75"
        >
            {body}
        </button>
    ) : (
        <div className="flex min-w-0 basis-56 items-center gap-3">{body}</div>
    );
}

function Chip({
    href: to,
    active,
    label,
    tone,
}: {
    href: string;
    active: boolean;
    label: string;
    tone?: string;
}) {
    return (
        <Link
            href={to}
            scroll={false}
            className={cn(
                tone ?? "tone-slate",
                "shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] transition-colors",
                active
                    ? "border-tone-line bg-tone-soft font-medium text-tone-text"
                    : "border-line text-muted hover:bg-tone-soft hover:text-tone-text",
            )}
        >
            {label}
        </Link>
    );
}

function PageLink({ href: to, disabled, label }: { href: string; disabled: boolean; label: string }) {
    if (disabled) {
        return <span className="rounded-full border border-line px-4 py-2 text-faint opacity-50">{label}</span>;
    }
    return (
        <Link
            href={to}
            className="rounded-full border border-line px-4 py-2 text-muted transition-colors hover:bg-surface hover:text-text"
        >
            {label}
        </Link>
    );
}
