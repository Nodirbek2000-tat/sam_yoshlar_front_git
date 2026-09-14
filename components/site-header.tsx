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
import type { User } from "@/lib/types";

const NAV: { href: string; label: string; icon: IconName }[] = [
    { href: "/yangiliklar", label: "Yangiliklar", icon: "news" },
    { href: "/tadbirlar", label: "Tadbirlar", icon: "calendar" },
    { href: "/elonlar", label: "E'lonlar", icon: "megaphone" },
    { href: "/tashabbuslar", label: "Tashabbuslar", icon: "spark" },
    { href: "/tadbirkorlar", label: "Tadbirkorlar", icon: "briefcase" },
    { href: "/startaplar", label: "Startaplar", icon: "rocket" },
    { href: "/tengdoshlar", label: "Tengdoshlar", icon: "globe" },
];

export function SiteHeader({ user }: { user: User | null }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <header className="sticky top-0 z-50 border-b border-line bg-page/80 backdrop-blur-xl">
            <div className="container-page flex h-15 items-center gap-6">
                <Link href="/" aria-label="Bosh sahifa" className="flex shrink-0 items-center">
                    <BrandLogo height={50} priority className="transition-opacity hover:opacity-85" />
                </Link>

                <nav className="hidden items-center gap-0.5 xl:flex">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors duration-150",
                                isActive(item.href)
                                    ? "font-medium text-text"
                                    : "text-muted hover:text-text",
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    <ThemeToggle className="hidden sm:flex" />

                    {user ? (
                        <div className="flex items-center gap-1.5">
                            {user.is_panel_admin && (
                                <Link
                                    href="/nazorat"
                                    title="Boshqaruv paneli"
                                    className="hidden size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-text sm:grid"
                                >
                                    <Icon name="settings" size={16} />
                                </Link>
                            )}

                            <Link
                                href="/kabinet"
                                title={user.full_name}
                                className="grid size-8 place-items-center overflow-hidden rounded-full bg-invert text-[11px] font-semibold text-on-invert"
                            >
                                {user.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={user.avatar} alt="" className="size-full object-cover" />
                                ) : (
                                    user.initials
                                )}
                            </Link>

                            <LogoutButton
                                name={user.full_name}
                                className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface hover:text-text"
                            />
                        </div>
                    ) : (
                        <Link
                            href="/kirish"
                            className="hidden rounded-full bg-invert px-4 py-1.5 text-[13px] font-medium text-on-invert transition-opacity hover:opacity-90 sm:block"
                        >
                            Kirish
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
                        aria-expanded={open}
                        className="grid size-9 place-items-center rounded-lg text-text transition-colors hover:bg-surface xl:hidden"
                    >
                        <Icon name={open ? "close" : "menu"} size={18} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.nav
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden border-t border-line bg-page xl:hidden"
                    >
                        <div className="container-page grid gap-0.5 py-3">
                            {NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    // Sahifaga o'tilganda menyu yopiladi
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors",
                                        isActive(item.href)
                                            ? "bg-surface font-medium text-text"
                                            : "text-muted",
                                    )}
                                >
                                    <Icon name={item.icon} size={17} className="text-faint" />
                                    {item.label}
                                </Link>
                            ))}

                            <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
                                <ThemeToggle />
                                {!user && (
                                    <Link
                                        href="/kirish"
                                        onClick={() => setOpen(false)}
                                        className="rounded-full bg-invert px-5 py-2 text-[14px] font-medium text-on-invert"
                                    >
                                        Kirish
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}
