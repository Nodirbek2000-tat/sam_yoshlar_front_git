import Link from "next/link";

import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Startaplar bo'limining ikki qismi: saytda ro'yxatdan o'tgan startaplar va
 * Samarqand startuplar ofisi reestri. Ikkala sahifaning tepasida turadi.
 */
const TABS: { href: string; key: "startaplar" | "ofis"; label: string; hint: string; icon: IconName }[] = [
    {
        href: "/startaplar",
        key: "startaplar",
        label: "Startaplar",
        hint: "Saytda ro'yxatdan o'tganlar",
        icon: "rocket",
    },
    {
        href: "/startuplar-ofisi",
        key: "ofis",
        label: "Samarqand startuplar ofisi",
        hint: "Viloyat reestridagi loyihalar",
        icon: "building",
    },
];

export function StartupTabs({ active }: { active: "startaplar" | "ofis" }) {
    return (
        <nav aria-label="Startaplar bo'limi" className="mb-8 grid gap-2.5 sm:grid-cols-2 lg:max-w-3xl">
            {TABS.map((tab) => {
                const current = tab.key === active;
                return (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                            "group flex items-center gap-3.5 rounded-2xl border p-3.5 transition-colors duration-200",
                            current
                                ? "border-transparent bg-invert text-on-invert"
                                : "border-line bg-raised hover:border-accent/40",
                        )}
                    >
                        <span
                            className={cn(
                                "grid size-11 shrink-0 place-items-center rounded-xl",
                                current ? "bg-on-invert/10" : "bg-accent/10 text-accent",
                            )}
                        >
                            <Icon name={tab.icon} size={19} />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px] font-semibold">{tab.label}</span>
                            <span className={cn("block truncate text-[12.5px]", current ? "opacity-70" : "text-muted")}>
                                {tab.hint}
                            </span>
                        </span>
                        {!current && (
                            <Icon
                                name="arrowRight"
                                size={15}
                                className="shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5"
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
