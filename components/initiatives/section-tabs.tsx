"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Icon, type IconName } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Tashabbuslar bo'limining ikki qismi.
 *
 * Yoshlar tashabbuslari — yoshlar g'oya bildiradi va ovoz beradi.
 * Tashkilotlar — tashkilot muammosini yozadi, yoshlar taklif beradi.
 */
const TABS: { href: string; label: string; icon: IconName; tone: string }[] = [
    {
        href: "/tashabbuslar/yoshlar",
        label: "Yoshlar tashabbuslari",
        icon: "spark",
        tone: "tone-emerald",
    },
    {
        href: "/tashabbuslar/muammolar",
        label: "Tashkilotlar",
        icon: "building",
        tone: "tone-violet",
    },
];

export function SectionTabs() {
    const pathname = usePathname();

    return (
        <div className="inline-flex rounded-full border border-line bg-page/70 p-1 backdrop-blur">
            {TABS.map((tab) => {
                const active = pathname.startsWith(tab.href);

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            tab.tone,
                            "relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition-colors duration-200",
                            active ? "font-medium text-tone-text" : "text-muted hover:text-text",
                        )}
                    >
                        {active && (
                            <motion.span
                                layoutId="initiatives-tab"
                                className="absolute inset-0 -z-10 rounded-full border border-tone-line bg-tone-soft"
                                transition={{ type: "spring", stiffness: 400, damping: 34 }}
                            />
                        )}
                        <Icon name={tab.icon} size={15} />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
