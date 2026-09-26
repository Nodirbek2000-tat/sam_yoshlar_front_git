"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { Icon, type IconName } from "@/components/icon";
import { Img } from "@/components/img";
import { ThemeToggle } from "@/components/theme/toggle";
import { cn } from "@/lib/cn";
import { useSessionUser } from "@/lib/use-session-user";

/**
 * Chiqish tugmasi animatsiya kutubxonasini ishlatadi — uni faqat kirgan
 * foydalanuvchiga, kerak bo'lganda yuklaymiz. Mehmon sahifasi yengil qoladi.
 */
const LogoutButton = dynamic(
    () => import("@/components/auth/logout-button").then((module) => module.LogoutButton),
    { ssr: false, loading: () => <span className="size-8" aria-hidden /> },
);

const NAV: { href: string; label: string; icon: IconName }[] = [
    { href: "/yangiliklar", label: "Yangiliklar", icon: "news" },
    { href: "/tadbirlar", label: "Tadbirlar", icon: "calendar" },
    { href: "/elonlar", label: "E'lonlar", icon: "megaphone" },
    { href: "/tashabbuslar", label: "Tashabbuslar", icon: "spark" },
    { href: "/tadbirkorlar", label: "Tadbirkorlar", icon: "briefcase" },
    { href: "/startaplar", label: "Startaplar", icon: "rocket" },
    { href: "/tengdoshlar", label: "Tengdoshlar", icon: "globe" },
];

/**
 * Sayt sarlavhasi. Kim kirgani brauzerda olinadi (`useSessionUser`) —
 * shunda sahifalarning o'zi hamma uchun bir xil bo'lib keshlanadi.
 */
export function SiteHeader() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const { user, ready } = useSessionUser();

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

                    {!ready ? (
                        // Kim kirgani hali aniq emas — tugma o'rnida bo'sh joy (miltillamasin)
                        <span aria-hidden className="hidden h-8 w-20 animate-pulse rounded-full bg-surface sm:block" />
                    ) : user ? (
                        <div className="flex items-center gap-1.5">
                            {user.is_panel_admin && (
                                <Link
                                    href="/nazorat"
                                    title="Boshqaruv paneli"
                                    aria-label="Boshqaruv paneli"
                                    className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent hover:text-accent"
                                >
                                    <Icon name="settings" size={17} />
                                </Link>
                            )}

                            <Link
                                href="/kabinet"
                                title={user.full_name}
                                className="grid size-8 place-items-center overflow-hidden rounded-full bg-invert text-[11px] font-semibold text-on-invert"
                            >
                                {user.avatar ? (
                                    <Img src={user.avatar} sizes="40px" maxWidth={128} className="size-full object-cover" />
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

            {/* Telefon menyusi — CSS bilan ochiladi (balandlik 0fr -> 1fr) */}
            <nav
                aria-hidden={!open}
                inert={!open}
                className={cn(
                    "grid bg-page transition-[grid-template-rows,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] xl:hidden",
                    open ? "grid-rows-[1fr] border-t border-line opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
            >
                <div className="min-h-0 overflow-hidden">
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

                        {user?.is_panel_admin && (
                            <Link
                                href="/nazorat"
                                onClick={() => setOpen(false)}
                                className="mt-1 flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 text-[15px] font-medium text-text"
                            >
                                <Icon name="settings" size={17} className="text-accent" />
                                Boshqaruv paneli
                            </Link>
                        )}

                        <div className="mt-2 flex items-center justify-between border-t border-line pt-3">
                            <ThemeToggle />
                            {ready && !user && (
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
                </div>
            </nav>
        </header>
    );
}
