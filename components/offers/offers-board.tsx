"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { EmptyState, PageHead } from "@/components/cabinet/ui";
import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { cn } from "@/lib/cn";
import { formatShortDate } from "@/lib/format";
import type { MyOffers, OfferStatus, ReceivedOffer, SentOffer } from "@/lib/types";
import { notifySessionChanged } from "@/lib/use-session-user";

/**
 * Kabinet: startaplarimga kelgan investitsiya takliflari va men yuborganlar.
 *
 * Ega shu yerda investor bilan bog'lanadi (telefon, Telegram), taklifni
 * qabul qiladi va keyin suhbat natijasini yozadi.
 */

const FeedbackDialog = dynamic(() => import("./feedback-dialog"), { ssr: false });

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

function StatusChip({ status, label }: { status: OfferStatus; label: string }) {
    return (
        <span
            className={cn(
                STATUS_TONE[status],
                "shrink-0 rounded-full bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text",
            )}
        >
            {label}
        </span>
    );
}

export function OffersBoard({ data }: { data: MyOffers }) {
    const router = useRouter();
    const [busyId, setBusyId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
    const [feedbackFor, setFeedbackFor] = useState<ReceivedOffer | null>(null);

    async function respond(offer: ReceivedOffer, action: "accept" | "decline") {
        if (action === "decline" && !confirm(`${offer.full_name} taklifi rad etilsinmi?`)) return;

        setBusyId(offer.id);
        setMessage(null);
        try {
            const response = await fetch(`/api/proxy/me/offers/${offer.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (response.ok) {
                setMessage({
                    ok: true,
                    text:
                        action === "accept"
                            ? "Qabul qilindi — investorga xabar yuborildi. Endi u bilan bog'laning."
                            : "Taklif rad etildi.",
                });
                router.refresh();
            } else {
                setMessage({ ok: false, text: "Bajarib bo'lmadi. Qayta urinib ko'ring." });
            }
        } catch {
            setMessage({ ok: false, text: "Internet aloqasini tekshiring." });
        } finally {
            setBusyId(null);
        }
    }

    const empty = !data.received.length && !data.sent.length;

    return (
        <>
            <PageHead
                title="Investitsiya takliflari"
                subtitle="Startaplaringizga qiziqish bildirgan investorlar va siz yuborgan takliflar."
            />

            {message && (
                <p
                    className={cn(
                        message.ok ? "tone-emerald" : "tone-rose",
                        "mb-5 inline-flex items-center gap-2 rounded-full bg-tone-soft px-4 py-2 text-[13px] text-tone-text",
                    )}
                >
                    <Icon name={message.ok ? "check" : "alert"} size={14} />
                    {message.text}
                </p>
            )}

            {empty && (
                <EmptyState
                    icon="bank"
                    title="Hozircha taklif yo'q"
                    text="Startapingizga investor qiziqish bildirsa yoki o'zingiz biror startapga taklif yuborsangiz, shu yerda ko'rinadi."
                    href="/startaplar"
                    action="Startaplarni ko'rish"
                />
            )}

            {data.received.length > 0 && (
                <section>
                    <SectionTitle text="Startaplarimga kelgan takliflar" count={data.received.length} />
                    <ul className="mt-3 space-y-3">
                        {data.received.map((offer) => (
                            <ReceivedCard
                                key={offer.id}
                                offer={offer}
                                busy={busyId === offer.id}
                                onRespond={respond}
                                onFeedback={() => setFeedbackFor(offer)}
                            />
                        ))}
                    </ul>
                </section>
            )}

            {data.sent.length > 0 && (
                <section className={cn(data.received.length > 0 && "mt-10")}>
                    <SectionTitle text="Men yuborgan takliflar" count={data.sent.length} />
                    <ul className="mt-3 divide-y divide-line border-y border-line">
                        {data.sent.map((offer) => (
                            <SentRow key={offer.id} offer={offer} />
                        ))}
                    </ul>
                </section>
            )}

            {feedbackFor && (
                <FeedbackDialog
                    // Har bir taklif uchun forma yangidan ochiladi
                    key={feedbackFor.id}
                    open
                    target={{
                        id: feedbackFor.id,
                        startup_name: feedbackFor.startup.name,
                        investor_name: feedbackFor.full_name,
                    }}
                    initial={{ outcome: feedbackFor.outcome, feedback: feedbackFor.feedback }}
                    onClose={() => setFeedbackFor(null)}
                    onDone={() => {
                        setFeedbackFor(null);
                        // Sarlavhadagi «fikr so'rash» ham yangilansin
                        notifySessionChanged();
                        router.refresh();
                    }}
                />
            )}
        </>
    );
}

function SectionTitle({ text, count }: { text: string; count: number }) {
    return (
        <h3 className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.1em] text-faint">
            {text}
            <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] tabular-nums text-muted">
                {count}
            </span>
        </h3>
    );
}

function ReceivedCard({
    offer,
    busy,
    onRespond,
    onFeedback,
}: {
    offer: ReceivedOffer;
    busy: boolean;
    onRespond: (offer: ReceivedOffer, action: "accept" | "decline") => void;
    onFeedback: () => void;
}) {
    const initials =
        offer.investor?.initials ||
        offer.full_name
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase();

    const name = offer.investor ? (
        <Link
            href={`/insonlar/${offer.investor.id}`}
            className="underline-offset-4 transition-colors hover:text-tone-text hover:underline"
        >
            {offer.full_name}
        </Link>
    ) : (
        offer.full_name
    );

    return (
        <li
            className={cn(
                STATUS_TONE[offer.status],
                "rounded-2xl border bg-raised p-4 transition-opacity sm:p-5",
                offer.status === "new" ? "border-tone-line" : "border-line",
                busy && "opacity-60",
            )}
        >
            <div className="flex items-start gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-tone-line bg-tone-soft text-[12.5px] font-semibold text-tone-text">
                    {offer.investor?.avatar ? (
                        <Img
                            src={offer.investor.avatar}
                            sizes="44px"
                            maxWidth={128}
                            className="size-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </span>

                <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold leading-snug">{name}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12.5px] text-faint">
                        <Link
                            href={`/startaplar/${offer.startup.id}`}
                            className="inline-flex items-center gap-1 text-muted transition-colors hover:text-text"
                        >
                            <Icon name="rocket" size={12} />
                            {offer.startup.name}
                        </Link>
                        <span>·</span>
                        <span>{formatShortDate(offer.created_at)}</span>
                    </p>
                </div>

                <StatusChip status={offer.status} label={offer.status_display} />
            </div>

            {/* Aloqa — bir bosishda qo'ng'iroq yoki Telegram */}
            <div className="mt-4 flex flex-wrap gap-2">
                <a
                    href={`tel:${offer.phone}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-page px-3.5 py-2 text-[13.5px] font-medium tabular-nums transition-colors hover:border-tone-line hover:text-tone-text"
                >
                    <Icon name="phone" size={14} />
                    {offer.phone}
                </a>
                {offer.telegram && (
                    <a
                        href={`https://t.me/${offer.telegram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="tone-blue inline-flex items-center gap-2 rounded-full border border-tone-line bg-tone-soft px-3.5 py-2 text-[13.5px] font-medium text-tone-text transition-opacity hover:opacity-85"
                    >
                        <Icon name="telegram" size={14} />@{offer.telegram}
                    </a>
                )}
                {offer.investor && (
                    <Link
                        href={`/insonlar/${offer.investor.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[13.5px] text-muted transition-colors hover:text-text"
                    >
                        <Icon name="user" size={14} />
                        Profili
                    </Link>
                )}
            </div>

            {offer.status === "new" && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                    <button
                        type="button"
                        onClick={() => onRespond(offer, "accept")}
                        disabled={busy}
                        className="inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-semibold text-on-invert transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        <Icon name="check" size={14} strokeWidth={2.4} />
                        Qabul qilaman
                    </button>
                    <button
                        type="button"
                        onClick={() => onRespond(offer, "decline")}
                        disabled={busy}
                        className="rounded-full border border-line px-4 py-2.5 text-[13.5px] text-muted transition-colors hover:bg-surface hover:text-text disabled:opacity-50"
                    >
                        Rad etish
                    </button>
                    <span className="text-[12.5px] text-faint">
                        Avval bog&apos;laning, so&apos;ng qabul qiling.
                    </span>
                </div>
            )}

            {offer.status === "accepted" &&
                (offer.feedback_at ? (
                    <div className="mt-4 border-t border-line pt-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={cn(
                                    OUTCOME_TONE[offer.outcome] ?? "tone-slate",
                                    "rounded-full bg-tone-soft px-2.5 py-1 text-[12px] font-medium text-tone-text",
                                )}
                            >
                                {offer.outcome_display}
                            </span>
                            <span className="text-[12px] text-faint">
                                {formatShortDate(offer.feedback_at)}
                            </span>
                            <button
                                type="button"
                                onClick={onFeedback}
                                className="ml-auto text-[12.5px] text-muted underline-offset-4 transition-colors hover:text-text hover:underline"
                            >
                                O&apos;zgartirish
                            </button>
                        </div>
                        {offer.feedback && (
                            <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-muted">
                                {offer.feedback}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                        <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-muted">
                            Investor bilan gaplashdingizmi? Suhbat natijasini ayting.
                        </p>
                        <button
                            type="button"
                            onClick={onFeedback}
                            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-tone-line bg-tone-soft px-4 py-2 text-[13px] font-medium text-tone-text transition-opacity hover:opacity-85"
                        >
                            <Icon name="chat" size={14} />
                            Fikr bildirish
                        </button>
                    </div>
                ))}
        </li>
    );
}

function SentRow({ offer }: { offer: SentOffer }) {
    return (
        <li className="flex items-center gap-3.5 py-3.5">
            <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface text-muted">
                {offer.startup.logo_url ? (
                    <Img
                        src={offer.startup.logo_url}
                        alt={offer.startup.name}
                        sizes="40px"
                        maxWidth={128}
                        className="size-full object-cover"
                    />
                ) : (
                    <Icon name="rocket" size={17} />
                )}
            </span>

            <div className="min-w-0 flex-1">
                <Link
                    href={`/startaplar/${offer.startup.id}`}
                    className="block truncate text-[14.5px] font-medium transition-colors hover:text-accent-text"
                >
                    {offer.startup.name}
                </Link>
                <p className="mt-0.5 text-[12.5px] text-faint">
                    {formatShortDate(offer.created_at)} yuborilgan
                    {offer.status === "accepted" && " · asoschi siz bilan bog'lanadi"}
                </p>
            </div>

            <StatusChip status={offer.status} label={offer.status_display} />
        </li>
    );
}
