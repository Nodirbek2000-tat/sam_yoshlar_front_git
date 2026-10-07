import Link from "next/link";

import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/cn";

const TABS: { key: "elonlar" | "sorovnomalar"; href: string; label: string; icon: IconName }[] = [
    { key: "elonlar", href: "/nazorat/elonlar", label: "E'lonlar", icon: "megaphone" },
    { key: "sorovnomalar", href: "/nazorat/elonlar/sorovnomalar", label: "So'rovnomalar", icon: "vote" },
];

/** E'lonlar bo'limining ikki qismi: oddiy e'lonlar va so'rovnomalar. */
export function AnnouncementTabs({ active }: { active: "elonlar" | "sorovnomalar" }) {
    return (
        <nav className="mb-7 inline-flex rounded-full border border-line bg-surface p-1">
            {TABS.map((tab) => (
                <Link
                    key={tab.key}
                    href={tab.href}
                    aria-current={tab.key === active ? "page" : undefined}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors",
                        tab.key === active
                            ? "bg-page text-text shadow-sm"
                            : "text-muted hover:text-text",
                    )}
                >
                    <Icon name={tab.icon} size={15} />
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}
