import Link from "next/link";

import { CategoryIcon } from "@/components/category-icon";
import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/format";
import { toneClass } from "@/lib/tone";
import type { PublicBusiness, PublicStartup } from "@/lib/types";

/**
 * Tadbirkor va startap kartalari — ro'yxat sahifasida ham, bosh sahifada ham.
 *
 * Tadbirkor kartasi rasmli: muqova — ular yuklagan birinchi rasm, ustida
 * logotip. Startap kartasi esa logotip va raqamlar atrofida quriladi —
 * investor avval bosqich va kerakli mablag'ni ko'radi.
 */

/** Bosqich — rang bilan: g'oyadan kengayishgacha. */
export const STAGE_TONE: Record<string, string> = {
    idea: "tone-amber",
    mvp: "tone-cyan",
    launched: "tone-emerald",
    scaling: "tone-violet",
};

function Logo({
    url,
    name,
    icon,
    className,
}: {
    url: string | null;
    name: string;
    icon: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "grid shrink-0 place-items-center overflow-hidden bg-page text-tone-text",
                className,
            )}
        >
            {url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={url} alt={name} className="size-full object-cover" />
            ) : (
                <CategoryIcon slug={icon} size={22} />
            )}
        </span>
    );
}

export function BusinessCard({ business }: { business: PublicBusiness }) {
    return (
        <Link
            href={`/tadbirkorlar/${business.id}`}
            className={cn(
                toneClass(business.sphere_icon),
                "group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised transition-all duration-300 hover:-translate-y-1 hover:border-tone-line hover:shadow-[0_18px_40px_-22px_var(--tone)]",
            )}
        >
            {/* Muqova */}
            <div className="relative aspect-[16/10] overflow-hidden bg-tone-soft">
                {business.cover_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={business.cover_url}
                        alt=""
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                ) : (
                    <span className="grid size-full place-items-center">
                        <CategoryTile slug={business.sphere_icon} size="xl" />
                    </span>
                )}
                <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />

                {business.photo_count > 1 && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
                        <Icon name="image" size={12} />
                        {business.photo_count}
                    </span>
                )}
            </div>

            <div className="relative flex flex-1 flex-col px-5 pb-5">
                {/* Logo muqova ustiga chiqib turadi */}
                <Logo
                    url={business.logo_url}
                    name={business.name}
                    icon={business.sphere_icon}
                    className="-mt-8 size-16 rounded-2xl border-4 border-raised shadow-sm"
                />

                <h3 className="mt-3 text-[16.5px] font-semibold leading-snug">{business.name}</h3>

                <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
                    <span className="rounded-full bg-tone-soft px-2.5 py-0.5 font-medium text-tone-text">
                        {business.sphere_display}
                    </span>
                    {business.region_display && (
                        <span className="inline-flex items-center gap-1 text-muted">
                            <Icon name="pin" size={12} />
                            {business.district || business.region_display}
                        </span>
                    )}
                </p>

                <p className="mt-3 line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-muted">
                    {business.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5 text-[12px] text-faint">
                    <span className="flex gap-3">
                        {business.founded_year && <span>{business.founded_year}-yildan</span>}
                        {business.employees > 1 && <span>{business.employees} xodim</span>}
                    </span>
                    <Icon
                        name="arrowRight"
                        size={14}
                        className="text-tone-text transition-transform duration-300 group-hover:translate-x-1"
                    />
                </div>
            </div>
        </Link>
    );
}

export function StartupCard({ startup }: { startup: PublicStartup }) {
    const investment = formatMoney(startup.needed_investment);

    return (
        <Link
            href={`/startaplar/${startup.id}`}
            className={cn(
                toneClass(startup.sphere_icon),
                "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised p-5 transition-all duration-300 hover:-translate-y-1 hover:border-tone-line hover:shadow-[0_18px_40px_-22px_var(--tone)]",
            )}
        >
            {/* Yuqoridagi rangli chiziq */}
            <span className="tone-top absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />

            <div className="flex items-start justify-between gap-3">
                <Logo
                    url={startup.logo_url}
                    name={startup.name}
                    icon={startup.sphere_icon}
                    className="size-14 rounded-2xl border border-tone-line"
                />
                <span
                    className={cn(
                        STAGE_TONE[startup.stage] ?? "tone-slate",
                        "shrink-0 rounded-full border border-tone-line bg-tone-soft px-2.5 py-1 text-[11.5px] font-medium text-tone-text",
                    )}
                >
                    {startup.stage_display}
                </span>
            </div>

            <h3 className="mt-4 text-[16.5px] font-semibold leading-snug">{startup.name}</h3>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-tone-text">
                <CategoryIcon slug={startup.sphere_icon} size={13} />
                {startup.sphere_display}
            </p>

            <p className="mt-3 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-muted">
                {startup.about}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3.5 text-[12px]">
                <div>
                    <dt className="text-faint">Jamoa</dt>
                    <dd className="mt-0.5 font-medium">{startup.team_size} kishi</dd>
                </div>
                <div>
                    <dt className="text-faint">Investitsiya</dt>
                    <dd className="mt-0.5 font-medium">{investment || "—"}</dd>
                </div>
            </dl>
        </Link>
    );
}
