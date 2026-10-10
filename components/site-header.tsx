"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { Icon, type IconName } from "@/components/icon";
import { Img } from "@/components/img";
import { NewNoticeCallout, NotificationBell } from "@/components/notification-bell";
import { FeedbackPrompt } from "@/components/offers/feedback-prompt";
import { ThemeToggle } from "@/components/theme/toggle";
import { cn } from "@/lib/cn";
import { useSessionUser } from "@/lib/use-session-user";

/**
 * Chiqish tugmasi animatsiya kutubxonasini ishlatadi — uni faqat kirgan
 * foydalanuvchiga, kerak bo'lganda yuklaymiz. Mehmon sahifasi yengil qoladi.
 */
const LogoutButton = dynamic(
    () => import("@/components/auth/logout-button").then((module) => module.LogoutButton),
    { ssr: false, loading: () => <span className="hidden size-8 sm:block" aria-hidden /> },
);

const NAV: { href: string; label: string; icon: IconName }[] = [
    { href: "/yangiliklar", label: "Yangiliklar", icon: "news" },
    { href: "/tadbirlar", label: "Tadbirlar", icon: "calendar" },
    { href: "/elonlar", label: "E'lonlar", icon: "megaphone" },
    { href: "/tashabbuslar", label: "Tashabbuslar", icon: "spark" },
    { href: "/tadbirkorlar", label: "Tadbirkorlar", icon: "briefcase" },
    { href: "/startaplar", label: "Startaplar", icon: "rocket" },
    { href: "/startuplar-ofisi", label: "Startuplar ofisi", icon: "building" },
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
            <div className="container-page flex h-15 items-center gap-3 sm:gap-6 xl:gap-4">
                <Link href="/" aria-label="Bosh sahifa" className="flex shrink-0 items-center">
                    {/*
                      Telefonda logo kichikroq, juda tor ekranda faqat belgi — aks holda
                      o'ngdagi tugmalar ekrandan chiqib ketadi. Rasm manzillari bir xil,
                      brauzer ularni bir marta yuklaydi.
                    */}
                    <BrandLogo variant="mark" height={36} priority className="min-[360px]:hidden" />
                    <BrandLogo height={34} priority className="hidden min-[360px]:inline-flex sm:hidden" />
                    <BrandLogo
                        height={50}
                        priority
                        className="hidden transition-opacity hover:opacity-85 sm:inline-flex xl:hidden 2xl:inline-flex"
                    />
                    {/* 1280–1535px: menyu bandlari ko'p — logo biroz kichikroq, hammasi bir qatorda sig'sin */}
                    <BrandLogo
                        height={40}
                        priority
                        className="hidden transition-opacity hover:opacity-85 xl:inline-flex 2xl:hidden"
                    />
                </Link>

                <nav className="hidden items-center xl:flex">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                // 8 ta band bir qatorda sig'ishi uchun: bo'linmaydi, tor ekranda zichroq
                                "whitespace-nowrap rounded-md px-1.5 py-1.5 text-[13px] transition-colors duration-150 2xl:px-2 2xl:text-[13.5px]",
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
                    {/* Juda tor noutbuk ekranida (1280–1359px) joy menyu bandlariga beriladi */}
                    <ThemeToggle className="hidden sm:flex xl:max-[1359px]:hidden" />

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
                                    // Telefonda bu tugma menyu ichida — o'rniga qo'ng'iroqcha sig'adi
                                    className="hidden size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent hover:text-accent sm:grid"
                                >
                                    <Icon name="settings" size={17} />
                                </Link>
                            )}

                            {/* Yangi xabar kelganda yorliq shu qo'ng'iroqcha ostidan chiqadi */}
                            <div className="relative">
                                <NotificationBell unread={user.unread} />
                                {user.unread > 0 && !open && <NewNoticeCallout unread={user.unread} />}
                            </div>

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

                            {/* Telefonda chiqish tugmasi menyu ichida */}
                            <LogoutButton
                                name={user.full_name}
                                className="hidden size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-surface hover:text-text sm:grid"
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

            {/* Startap egasidan investor bilan suhbat natijasi so'raladi */}
            {user?.feedback && <FeedbackPrompt key={user.feedback.id} feedback={user.feedback} />}

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
                            {user && (
                                <LogoutButton
                                    name={user.full_name}
                                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[14px] text-muted"
                                >
                                    <Icon name="power" size={15} />
                                    Chiqish
                                </LogoutButton>
                            )}
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
