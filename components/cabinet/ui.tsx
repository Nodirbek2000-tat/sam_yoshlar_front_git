import Link from "next/link";
import type { ReactNode } from "react";

import { Icon, type IconName } from "@/components/icon";

/** Kabinet sahifalarining sarlavhasi. */
export function PageHead({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-3 pb-6">
            <div>
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="mt-1 text-[13.5px] text-muted">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

/** Hech narsa yo'q holati — har bir sahifada bir xil ko'rinsin. */
export function EmptyState({
    icon,
    title,
    text,
    href,
    action,
}: {
    icon: IconName;
    title: string;
    text: string;
    href?: string;
    action?: string;
}) {
    return (
        <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center">
            <Icon name={icon} size={22} className="mx-auto text-faint" strokeWidth={1.5} />
            <p className="mt-4 text-[14.5px] font-medium">{title}</p>
            <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">
                {text}
            </p>
            {href && action && (
                <Link
                    href={href}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-invert px-5 py-2.5 text-[13.5px] font-medium text-on-invert transition-opacity hover:opacity-90"
                >
                    {action}
                    <Icon name="arrowRight" size={14} />
                </Link>
            )}
        </div>
    );
}

export function RowList({ children }: { children: ReactNode }) {
    return <div className="divide-y divide-line border-y border-line">{children}</div>;
}

/** Holat belgisi: kutilmoqda / tasdiqlangan / rad etilgan. */
export function StatusBadge({ status, label }: { status: string; label: string }) {
    const tone =
        status === "approved" || status === "done"
            ? "bg-accent-soft text-accent-text"
            : status === "rejected"
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-surface text-muted";

    return (
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${tone}`}>
            {label}
        </span>
    );
}
