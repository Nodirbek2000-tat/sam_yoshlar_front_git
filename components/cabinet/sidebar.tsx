"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CategoryIcon } from "@/components/category-icon";
import { MenuIcon, type MenuIconName } from "@/components/menu-icon";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";

type Item = {
    href: string;
    label: string;
    /** Higgsfield menyu ikonkasi yoki kategoriya ikonkasi (`ic-briefcase`) */
    icon: MenuIconName | `ic-${string}`;
    /** Menyu bandining rangi — ikonka va tanlangan holat shundan oladi */
    tone: Tone;
    /** Yon menyuda ko'rinadigan raqam */
    countKey?: keyof Counts;
    /** Faqat shu rollarga ko'rinadi; berilmasa — hammaga */
    roles?: string[];
};

/** Tashkilot emas — oddiy odamlar (asosiy roli qanday bo'lishidan qat'i nazar) */
const PEOPLE = ["yosh", "entrepreneur", "startupper", "admin"];

export type Counts = {
    initiatives: number;
    events: number;
    comments: number;
    appeals: number;
    suggestions: number;
    unread: number;
};

const ITEMS: Item[] = [
    { href: "/kabinet", label: "Profil", icon: "profile", tone: "emerald" },
    // Bir odam bir nechta rolda bo'la oladi — bu uch bo'lim tashkilotdan boshqa hammaga
    {
        href: "/kabinet/biznesim",
        label: "Tadbirkorligim",
        icon: "ic-briefcase",
        tone: "amber",
        roles: PEOPLE,
    },
    {
        href: "/kabinet/startapim",
        label: "Startaplarim",
        icon: "ic-rocket",
        tone: "orange",
        roles: PEOPLE,
    },
    {
        href: "/kabinet/tengdosh",
        label: "Ta'lim profilim",
        icon: "ic-graduation",
        tone: "blue",
        roles: PEOPLE,
    },
    {
        href: "/kabinet/tashabbuslarim",
        label: "Tashabbuslarim",
        icon: "initiative",
        tone: "amber",
        countKey: "initiatives",
    },
    {
        href: "/kabinet/tadbirlarim",
        label: "Tadbirlarim",
        icon: "event",
        tone: "blue",
        countKey: "events",
    },
    {
        href: "/kabinet/muammolarim",
        label: "Muammolarim",
        icon: "appeal",
        tone: "violet",
        roles: ["organization"],
    },
    {
        href: "/kabinet/takliflarim",
        label: "Takliflarim",
        icon: "suggestion",
        tone: "violet",
        countKey: "comments",
    },
    {
        href: "/kabinet/murojaatlarim",
        label: "Murojaatlarim",
        icon: "appeal",
        tone: "cyan",
        countKey: "appeals",
    },
    {
        href: "/kabinet/bildirishnomalar",
        label: "Bildirishnomalar",
        icon: "bell",
        tone: "rose",
        countKey: "unread",
    },
];

export function CabinetSidebar({ counts, role }: { counts: Counts; role: string }) {
    const pathname = usePathname();
    const items = ITEMS.filter((item) => !item.roles || item.roles.includes(role));

    return (
        <nav className="lg:sticky lg:top-24">
            {/* Telefonda gorizontal lenta, kattaroq ekranda ustun */}
            <ul
                className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:grid lg:gap-0.5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
            >
                {items.map((item) => {
                    const active =
                        item.href === "/kabinet"
                            ? pathname === "/kabinet"
                            : pathname.startsWith(item.href);

                    const count = item.countKey ? counts[item.countKey] : undefined;
                    const highlight = item.countKey === "unread" && (count ?? 0) > 0;

                    return (
                        <li key={item.href} className="shrink-0 lg:shrink">
                            <Link
                                href={item.href}
                                className={cn(
                                    `tone-${item.tone}`,
                                    "group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] whitespace-nowrap transition-colors duration-150",
                                    active
                                        ? "font-medium text-tone-text"
                                        : "text-muted hover:text-tone-text",
                                )}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="cabinet-active"
                                        className="absolute inset-0 -z-10 rounded-lg border border-tone-line bg-tone-soft"
                                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                                    />
                                )}

                                {item.icon.startsWith("ic-") ? (
                                    <CategoryIcon
                                        slug={item.icon}
                                        size={17}
                                        className={active ? "text-tone-text" : "text-faint transition-colors group-hover:text-tone-text"}
                                    />
                                ) : (
                                    <MenuIcon
                                        name={item.icon as MenuIconName}
                                        size={17}
                                        className={active ? "text-tone-text" : "text-faint transition-colors group-hover:text-tone-text"}
                                    />
                                )}

                                <span className="flex-1">{item.label}</span>

                                {count !== undefined && count > 0 && (
                                    <span
                                        className={cn(
                                            "rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                                            highlight
                                                ? "bg-tone text-page"
                                                : active
                                                  ? "text-tone-text"
                                                  : "text-faint",
                                        )}
                                    >
                                        {count}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
