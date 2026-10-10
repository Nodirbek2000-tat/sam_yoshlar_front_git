"use client";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";
import { socialOf } from "@/lib/social";

/** Har bir ijtimoiy holatda nechta (oxirgisi — «ko'rsatilmagan», qiymati `yoq`). */
export type SocialCount = { value: string; label: string; count: number };

/** Panel filtri: ijtimoiy holat bo'yicha saralash — tuman filtri bilan bir xil ko'rinishda. */
export function SocialFilter({
    value,
    counts,
    onChange,
}: {
    value?: string;
    counts: SocialCount[];
    onChange: (value: string) => void;
}) {
    if (!counts.length) return null;

    const total = counts.reduce((sum, item) => sum + item.count, 0);
    const active = Boolean(value);

    return (
        <label
            className={cn(
                active ? "tone-indigo border-tone-line bg-tone-soft text-tone-text" : "border-line",
                "relative inline-flex h-9 max-w-full items-center gap-2 rounded-full border pl-3.5 pr-2 text-[12.5px] transition-colors",
            )}
        >
            <Icon name="user" size={14} className={active ? "" : "text-faint"} />
            <span className={cn("shrink-0", active ? "font-medium" : "text-muted")}>Ijtimoiy holat:</span>
            <select
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value)}
                aria-label="Ijtimoiy holat bo'yicha saralash"
                className="h-full min-w-0 max-w-[13rem] cursor-pointer appearance-none truncate bg-transparent pr-5 font-medium text-text focus:outline-none"
            >
                <option value="">Barchasi · {total}</option>
                {counts.map((item) => (
                    <option key={item.value} value={item.value}>
                        {item.label} · {item.count}
                    </option>
                ))}
            </select>
            <Icon name="arrowRight" size={12} className="pointer-events-none absolute right-3 rotate-90 text-faint" />
        </label>
    );
}

/** Ro'yxat qatoridagi kichik belgi: «Talaba · SamDU». */
export function SocialBadge({ status, display, place }: { status: string; display: string; place?: string }) {
    if (!status) return null;
    return (
        <span
            className={cn(
                `tone-${socialOf(status)?.tone ?? "slate"}`,
                "inline-flex max-w-full items-center gap-1 truncate rounded-full bg-tone-soft px-2.5 py-0.5 text-[11px] font-medium text-tone-text",
            )}
        >
            {display}
            {place ? <span className="truncate font-normal opacity-80">· {place}</span> : null}
        </span>
    );
}
