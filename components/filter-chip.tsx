import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";

/**
 * Filtr tugmasi. Tanlangani qora emas, kategoriya rangida yonadi —
 * shunda ro'yxat ustidagi qator ham sahifaning rang tilida gapiradi.
 */
export function FilterChip({
    href,
    active,
    label,
    tone,
    count,
    icon,
}: {
    href: string;
    active: boolean;
    label: string;
    /** Ohang manbai: ikonka kaliti yoki tur nomi. Bo'lmasa brend rangi. */
    tone?: string;
    count?: number;
    icon?: ReactNode;
}) {
    return (
        <Link
            href={href}
            scroll={false}
            className={cn(
                tone ? toneClass(tone) : undefined,
                "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] transition-colors duration-200",
                active
                    ? "border border-tone-line bg-tone-soft font-medium text-tone-text"
                    : "border border-line text-muted hover:border-tone-line hover:bg-tone-soft hover:text-tone-text",
            )}
        >
            {icon ?? (tone && <span className="size-1.5 rounded-full bg-tone" />)}
            {label}
            {typeof count === "number" && (
                <span className={cn("tabular-nums", active ? "opacity-70" : "text-faint")}>
                    {count}
                </span>
            )}
        </Link>
    );
}

/** Gorizontal aylanadigan filtr qatori. */
export function FilterRow({ children }: { children: ReactNode }) {
    return (
        <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] md:-mx-8 md:px-8 [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2">{children}</div>
        </div>
    );
}
