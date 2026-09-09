"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

type Option = { value: "light" | "dark" | "system"; label: string };

const OPTIONS: Option[] = [
    { value: "light", label: "Kunduzgi" },
    { value: "dark", label: "Kechki" },
    { value: "system", label: "Tizim" },
];

/** Uchta holatli almashtirgich: kunduzgi / kechki / tizim. */
export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Server tomonda tanlov noma'lum — hydration mos kelishi uchun kutamiz
    useEffect(() => setMounted(true), []);

    const current = mounted ? (theme ?? "system") : "system";

    return (
        <div
            role="group"
            aria-label="Ko'rinish rejimi"
            className={cn(
                "relative flex items-center gap-0.5 rounded-full border border-line p-0.5",
                className,
            )}
        >
            {OPTIONS.map((option) => {
                const active = current === option.value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        title={option.label}
                        aria-label={option.label}
                        aria-pressed={active}
                        className={cn(
                            "relative grid size-7 place-items-center rounded-full transition-colors duration-200",
                            active ? "text-text" : "text-faint hover:text-muted",
                        )}
                    >
                        {active && mounted && (
                            <motion.span
                                layoutId="theme-pill"
                                className="absolute inset-0 rounded-full bg-surface"
                                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            />
                        )}
                        <span className="relative">
                            <ThemeIcon kind={option.value} />
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

function ThemeIcon({ kind }: { kind: Option["value"] }) {
    const common = {
        width: 15,
        height: 15,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    if (kind === "light") {
        return (
            <svg {...common}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
        );
    }

    if (kind === "dark") {
        return (
            <svg {...common}>
                <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
            </svg>
        );
    }

    return (
        <svg {...common}>
            <rect x="2.5" y="4" width="19" height="13" rx="1.5" />
            <path d="M8.5 20.5h7" />
        </svg>
    );
}
