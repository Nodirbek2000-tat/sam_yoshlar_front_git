"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { BrandLogo } from "@/components/brand-logo";
import { Icon, type IconName } from "@/components/icon";
import { ThemeToggle } from "@/components/theme/toggle";
import { cn } from "@/lib/cn";
import { toneClass } from "@/lib/tone";
import type { User } from "@/lib/types";

type Item = { href: string; label: string; icon: IconName };

const GROUPS: { title: string; items: Item[] }[] = [
    {
        title: "Umumiy",
        items: [
            { href: "/nazorat", label: "Boshqaruv", icon: "chart" },
            { href: "/nazorat/foydalanuvchilar", label: "Foydalanuvchilar", icon: "users" },
            { href: "/nazorat/korxonalar", label: "Korxonalar", icon: "building" },
            { href: "/nazorat/import", label: "Import", icon: "package" },
            { href: "/nazorat/bot", label: "Botga yuborish", icon: "send" },
        ],
    },
    {
        title: "Kontent",
        items: [
            { href: "/nazorat/yangiliklar", label: "Yangiliklar", icon: "news" },
            { href: "/nazorat/tadbirlar", label: "Tadbirlar", icon: "calendar" },
            { href: "/nazorat/elonlar", label: "E'lonlar", icon: "megaphone" },
        ],
    },
    {
        title: "Tashabbuslar",
        items: [
            { href: "/nazorat/tashabbuslar", label: "Tashabbuslar", icon: "spark" },
            { href: "/nazorat/muammolar", label: "Tashkilot muammolari", icon: "clipboard" },
        ],
    },
    {
        title: "Boshqa",
        items: [
            { href: "/nazorat/tengdoshlar", label: "Tengdoshlar", icon: "globe" },
            { href: "/nazorat/startaplar", label: "Startaplar", icon: "rocket" },
        ],
    },
];

export function PanelSidebar({ user }: { user: User }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => setOpen(false), [pathname]);

    const isActive = (href: string) =>
        href === "/nazorat" ? pathname === "/nazorat" : pathname.startsWith(href);

    const nav = (
        <nav className="flex h-full flex-col">
            <Link
                href="/nazorat"
                className="flex h-15 shrink-0 items-center gap-2.5 border-b border-line px-5"
            >
                <BrandLogo variant="mark" height={32} />
                <span className="text-[14px] font-semibold tracking-tight">Boshqaruv</span>
            </Link>

            <div className="flex-1 overflow-y-auto px-3 py-5">
                {GROUPS.map((group) => (
                    <div key={group.title} className="mb-6 last:mb-0">
                        <h2 className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-faint">
                            {group.title}
                        </h2>
                        <ul className="grid gap-0.5">
                            {group.items.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                // Har bir band ikonkasi bo'yicha o'z rangini oladi
                                                toneClass(item.icon),
                                                "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] transition-colors duration-150",
                                                active
                                                    ? "font-medium text-tone-text"
                                                    : "text-muted hover:bg-tone-soft hover:text-tone-text",
                                            )}
                                        >
                                            {active && (
                                                <motion.span
                                                    layoutId="panel-active"
                                                    className="absolute inset-0 -z-10 rounded-lg border border-tone-line bg-tone-soft"
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 34,
                                                    }}
                                                />
                                            )}
                                            <Icon
                                                name={item.icon}
                                                size={16}
                                                className={
                                                    active
                                                        ? "text-tone-text"
                                                        : "text-faint transition-colors group-hover:text-tone-text"
                                                }
                                            />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="shrink-0 border-t border-line p-3">
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                    <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-invert text-[11px] font-semibold text-on-invert">
                        {user.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatar} alt="" className="size-full object-cover" />
                        ) : (
                            user.initials
                        )}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">
                            {user.full_name}
                        </span>
                        <span className="block text-[11.5px] text-faint">Administrator</span>
                    </span>
                    <LogoutButton
                        name={user.full_name}
                        className="grid size-7 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-surface hover:text-text"
                    >
                        <Icon name="power" size={14} />
                    </LogoutButton>
                </div>

                <Link
                    href="/"
                    className="mt-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] text-muted transition-colors hover:bg-surface hover:text-text"
                >
                    <Icon name="arrowLeft" size={13} />
                    Saytga qaytish
                </Link>

                <div className="mt-2 hidden justify-center lg:flex">
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );

    return (
        <>
            {/* Katta ekran */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-line bg-page lg:block">
                {nav}
            </aside>

            {/* Telefon: yuqori panel + chiqadigan menyu */}
            <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line bg-page/85 px-4 backdrop-blur-xl lg:hidden">
                <button
                    type="button"
                    onClick={() => setOpen((value) => !value)}
                    aria-label="Menyu"
                    className="grid size-9 place-items-center rounded-lg text-text hover:bg-surface"
                >
                    <Icon name={open ? "close" : "menu"} size={18} />
                </button>
                <span className="text-[14px] font-semibold tracking-tight">Boshqaruv</span>
                <ThemeToggle className="ml-auto" />
            </div>

            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-page lg:hidden"
                        >
                            {nav}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
