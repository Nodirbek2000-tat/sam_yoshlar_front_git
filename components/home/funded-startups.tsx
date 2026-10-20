"use client";

import dynamic from "next/dynamic";
import { useState, type CSSProperties } from "react";

import { Icon } from "@/components/icon";
import { Img } from "@/components/img";
import { cn } from "@/lib/cn";
import { formatMoney, formatNumber } from "@/lib/format";
import type { FundedList, FundedStartup } from "@/lib/types";

const FundedDialog = dynamic(() => import("./funded-dialog"), { ssr: false });

/** Shuncha va undan ko'p bo'lsa — kartalar cheksiz lenta bo'lib aylanadi */
const MARQUEE_FROM = 4;

/**
 * Bosh sahifaning eng tepasi: «Mablag' olgan startuplar».
 *
 * Kartalar cheksiz lentada sekin suzadi (sichqoncha ustida to'xtaydi),
 * bosilsa — qisqa batafsil ma'lumot oynada ochiladi. «Harakatni kamaytirish»
 * yoqilgan bo'lsa lenta to'xtaydi va yonga suriladigan ro'yxatga aylanadi.
 */
export function FundedStartups({ data }: { data: FundedList }) {
    const [open, setOpen] = useState<FundedStartup | null>(null);
    const items = data.results;
    if (!items.length) return null;

    const marquee = items.length >= MARQUEE_FROM;
    const totals = [
        data.totals.UZS ? formatMoney(data.totals.UZS, "UZS") : null,
        data.totals.USD ? formatMoney(data.totals.USD, "USD") : null,
    ].filter(Boolean);

    return (
        <section className="tone-emerald relative overflow-hidden border-b border-line">
            {/* Orqa fon: yumshoq yog'du va to'r */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-40 -top-48 size-[38rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_22%,transparent),transparent_68%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -right-48 top-10 size-[34rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,#3b82f6_16%,transparent),transparent_68%)]"
            />
            <div className="grid-lines absolute inset-0 opacity-[0.25] [mask-image:radial-gradient(70%_70%_at_50%_0%,#000,transparent)]" />

            <div className="container-page relative pb-6 pt-10 md:pt-14">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <span className="inline-flex items-center gap-2 rounded-full border border-tone-line bg-tone-soft px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-tone-text">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-tone opacity-60" />
                                <span className="relative inline-flex size-2 rounded-full bg-tone" />
                            </span>
                            Mablag&apos; olgan startuplar
                        </span>
                        <h2 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                            G&apos;oyadan — <span className="text-accent">sarmoyagacha</span>
                        </h2>
                        <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-muted">
                            Grant va investitsiya olgan yosh startaplar. Ularning yo&apos;li — sizning keyingi
                            qadamingiz uchun ilhom.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        <Stat value={formatNumber(data.count)} label="startap" />
                        {totals.map((total) => (
                            <Stat key={total} value={total as string} label="jami mablag'" accent />
                        ))}
                    </div>
                </div>
            </div>

            {marquee ? (
                <div
                    className="funded-marquee marquee relative pb-12 pt-4 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]"
                    style={{ "--funded-duration": `${Math.max(30, items.length * 7)}s` } as CSSProperties}
                >
                    {/* Oraliq kartaning o'ng chetida — ikki nusxa aynan teng, lenta sakramaydi */}
                    <div className="marquee-track funded-track">
                        {[...items, ...items].map((item, index) => (
                            <FundedCard
                                key={`${item.id}-${index}`}
                                item={item}
                                copy={index >= items.length}
                                className="mr-5"
                                onOpen={() => setOpen(item)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="container-page relative flex flex-wrap gap-5 pb-12 pt-4">
                    {items.map((item) => (
                        <FundedCard key={item.id} item={item} onOpen={() => setOpen(item)} />
                    ))}
                </div>
            )}

            <FundedDialog item={open} onClose={() => setOpen(null)} />
        </section>
    );
}

function Stat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
    return (
        <span
            className={cn(
                "inline-flex flex-col rounded-2xl border px-4 py-2.5 backdrop-blur",
                accent ? "border-tone-line bg-tone-soft" : "border-line bg-page/70",
            )}
        >
            <span
                className={cn(
                    "text-xl font-semibold tabular-nums tracking-tight md:text-2xl",
                    accent && "text-tone-text",
                )}
            >
                {value}
            </span>
            <span className="text-[12.5px] text-muted">{label}</span>
        </span>
    );
}

/** Karta: rasm ustida mablag', pastda nomi va kimdan olgani. */
function FundedCard({
    item,
    copy = false,
    className,
    onOpen,
}: {
    item: FundedStartup;
    copy?: boolean;
    className?: string;
    onOpen: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onOpen}
            // Lentaning ikkinchi nusxasi — faqat ko'rinish uchun, klaviatura va ekran o'quvchi o'tkazib yuboradi
            {...(copy ? { "aria-hidden": true, tabIndex: -1, "data-copy": "" } : {})}
            className={cn(
                "group relative w-[78vw] max-w-[340px] shrink-0 overflow-hidden rounded-3xl border border-line bg-raised text-left shadow-[0_24px_50px_-34px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:border-tone-line hover:shadow-[0_30px_60px_-30px_var(--tone)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-[340px]",
                className,
            )}
        >
            <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                {item.image ? (
                    <Img
                        src={item.image}
                        alt={item.name}
                        sizes="340px"
                        maxWidth={828}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                ) : (
                    <div className="grid size-full place-items-center bg-tone-soft text-tone-text">
                        <Icon name="rocket" size={44} strokeWidth={1.3} />
                    </div>
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                {item.amount ? (
                    <span className="absolute left-4 top-4 rounded-full bg-[#16a34a] px-3 py-1.5 text-[13px] font-semibold text-white shadow-lg">
                        {formatMoney(item.amount, item.currency)}
                    </span>
                ) : null}
                {item.year ? (
                    <span className="absolute right-4 top-4 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur">
                        {item.year}
                    </span>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="line-clamp-1 text-[19px] font-semibold tracking-tight text-white">{item.name}</h3>
                    {item.funder && (
                        <p className="mt-0.5 line-clamp-1 flex items-center gap-1.5 text-[13px] text-white/80">
                            <Icon name="building" size={13} />
                            {item.funder}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="line-clamp-1 text-[13px] text-muted">
                    {item.sphere || item.founder || "Batafsil ma'lumot"}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-medium text-tone-text">
                    Batafsil
                    <Icon name="arrowRight" size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
            </div>
        </button>
    );
}
