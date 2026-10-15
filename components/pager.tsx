import Link from "next/link";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Sahifalar: «Oldingi · 1 2 3 · Keyingi». Havolalar oddiy `<a>` — qidiruv
 * tizimlari ham keyingi sahifalarni topadi.
 *
 * `href(page)` tanlangan filtrlarni saqlagan holda manzil yasaydi.
 */
export function Pager({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
    if (pages <= 1) return null;

    // Ko'p sahifa bo'lsa: birinchi, oxirgi va joriy atrofi — qolgani «…»
    const shown = [...new Set([1, page - 1, page, page + 1, pages])]
        .filter((item) => item >= 1 && item <= pages)
        .sort((a, b) => a - b);

    return (
        <nav aria-label="Sahifalar" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
            <Step href={page > 1 ? href(page - 1) : null} label="Oldingi" icon="arrowLeft" />
            {shown.map((item, index) => (
                <span key={item} className="flex items-center gap-1.5">
                    {index > 0 && item - shown[index - 1] > 1 && <span className="px-1 text-faint">…</span>}
                    <Link
                        href={href(item)}
                        aria-current={item === page ? "page" : undefined}
                        className={cn(
                            "grid h-10 min-w-10 place-items-center rounded-full px-3 text-[13.5px] tabular-nums transition-colors",
                            item === page
                                ? "bg-invert font-medium text-on-invert"
                                : "border border-line text-muted hover:bg-surface hover:text-text",
                        )}
                    >
                        {item}
                    </Link>
                </span>
            ))}
            <Step href={page < pages ? href(page + 1) : null} label="Keyingi" icon="arrowRight" />
        </nav>
    );
}

function Step({ href, label, icon }: { href: string | null; label: string; icon: "arrowLeft" | "arrowRight" }) {
    const content = (
        <>
            {icon === "arrowLeft" && <Icon name={icon} size={14} />}
            <span className="hidden sm:inline">{label}</span>
            {icon === "arrowRight" && <Icon name={icon} size={14} />}
        </>
    );
    const base = "inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-3.5 text-[13.5px]";

    if (!href) {
        return (
            <span aria-disabled className={cn(base, "cursor-not-allowed text-faint opacity-50")}>
                {content}
            </span>
        );
    }
    return (
        <Link href={href} aria-label={label} className={cn(base, "text-muted transition-colors hover:bg-surface hover:text-text")}>
            {content}
        </Link>
    );
}

/** `?sahifa=` qiymati: noto'g'ri bo'lsa — 1. */
export function pageParam(raw: string | string[] | undefined) {
    const value = Number(typeof raw === "string" ? raw : 1);
    return Number.isInteger(value) && value > 1 ? value : 1;
}
