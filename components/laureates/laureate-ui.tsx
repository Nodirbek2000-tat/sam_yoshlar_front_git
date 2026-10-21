import Link from "next/link";

import { Icon } from "@/components/icon";
import { FounderAvatar } from "@/components/office/office-ui";
import { cn } from "@/lib/cn";
import type { Laureate } from "@/lib/types";

/**
 * «Mirzo Ulug'bek vorislari» — Samarqand viloyati Innovatsion rivojlanish
 * bo'linmasi. Har bir kartada muqova o'rnida bo'linma logosi turadi,
 * g'olibning o'z rasmi esa uning ustida.
 */

export const LAUREATE_LOGO = {
    src: "/vorislar/logo-640.webp",
    share: "/vorislar/logo-share.jpg",
};

/** Oldindan tayyorlangan muqova: logo va uning xira foni bitta faylda (brauzerda filtr yo'q). */
const LAUREATE_COVERS = {
    card: { src: "/vorislar/cover-640.webp", srcSet: "/vorislar/cover-640.webp 640w, /vorislar/cover-1200.webp 1200w" },
    wide: { src: "/vorislar/cover-wide-1080.webp", srcSet: undefined },
};

export function LaureateCover({
    shape = "card",
    priority = false,
    className,
}: {
    shape?: keyof typeof LAUREATE_COVERS;
    priority?: boolean;
    className?: string;
}) {
    const cover = LAUREATE_COVERS[shape];
    return (
        <div className={cn("relative overflow-hidden bg-[#dfe9f2]", className)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={cover.src}
                srcSet={cover.srcSet}
                sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                alt="Samarqand viloyati Innovatsion rivojlanish bo'linmasi"
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                {...(priority ? { fetchPriority: "high" as const } : {})}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
        </div>
    );
}

export function YearPill({ year, className }: { year: number; className?: string }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-page/95 px-2.5 py-1 text-[11.5px] font-semibold tabular-nums text-text",
                className,
            )}
        >
            <Icon name="calendar" size={12} />
            {year}
        </span>
    );
}

export function NationalBadge({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                "tone-amber inline-flex items-center gap-1.5 rounded-full border border-tone-line bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text",
                className,
            )}
        >
            <Icon name="trophy" size={12} />
            Respublika g&apos;olibi
        </span>
    );
}

/** Ro'yxatdagi karta: bo'linma logosi, ustida g'olib rasmi, loyiha nomi va yili. */
export function LaureateCard({ item }: { item: Laureate }) {
    return (
        <Link
            href={`/mirzo-ulugbek-vorislari/${item.id}`}
            className="cv-card tone-blue group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-raised transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-tone-line hover:shadow-[0_22px_44px_-26px_var(--tone)]"
        >
            <div className="relative aspect-[16/10] overflow-hidden">
                <LaureateCover className="size-full" />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
                <YearPill year={item.year} className="absolute right-3 top-3" />
            </div>

            <div className="relative flex flex-1 flex-col px-5 pb-5">
                <div className="-mt-7 flex items-end justify-between gap-3">
                    <FounderAvatar item={item} size={56} className="ring-4 ring-raised" />
                    {item.is_national_winner && <NationalBadge className="mb-1" />}
                </div>

                <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight">{item.project_name}</h3>
                {item.about && (
                    <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-muted">{item.about}</p>
                )}

                <div className="mt-auto pt-4">
                    <div className="flex items-center justify-between gap-3 border-t border-line pt-3.5">
                        <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium">{item.full_name}</p>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[12px] text-faint">
                                {item.age ? <span>{item.age} yosh</span> : null}
                                {item.age && item.district ? <span>·</span> : null}
                                {item.district && <span className="truncate">{item.district}</span>}
                            </p>
                        </div>
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-tone-soft text-tone-text transition-transform duration-300 group-hover:translate-x-0.5">
                            <Icon name="arrowRight" size={15} />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
