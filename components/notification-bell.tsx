"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Sarlavhadagi qo'ng'iroqcha va «yangi xabar keldi» yorlig'i.
 *
 * Yorliq faqat HAQIQATDA yangi xabar kelganda chiqadi: oxirgi ko'rilgan
 * son brauzerda saqlanadi, o'qilmaganlar undan oshsagina ko'rinadi.
 * Bosilsa yoki 12 soniyadan keyin yo'qoladi — qo'ng'iroqchadagi raqam qoladi.
 */

const HREF = "/kabinet/bildirishnomalar";
const KEY = "sy:unread-seen";
const EVENT = "sy:unread-seen";

function subscribe(callback: () => void) {
    window.addEventListener(EVENT, callback);
    window.addEventListener("storage", callback);
    return () => {
        window.removeEventListener(EVENT, callback);
        window.removeEventListener("storage", callback);
    };
}

function readSeen() {
    try {
        return Number(localStorage.getItem(KEY)) || 0;
    } catch {
        return 0;
    }
}

function writeSeen(count: number) {
    try {
        localStorage.setItem(KEY, String(count));
    } catch {
        // Maxfiy rejim — yorliq shunchaki qayta chiqishi mumkin
    }
    window.dispatchEvent(new Event(EVENT));
}

/** Yangi (hali ko'rsatilmagan) xabar bormi. */
function useFresh(unread: number) {
    // Serverda hech qachon «yangi» emas
    const seen = useSyncExternalStore(subscribe, readSeen, () => Number.MAX_SAFE_INTEGER);

    useEffect(() => {
        // O'qib bo'lingan — keyingi yangi xabar yana ko'rinsin
        if (unread < seen) writeSeen(unread);
    }, [unread, seen]);

    return unread > seen;
}

export function NotificationBell({ unread, className }: { unread: number; className?: string }) {
    const fresh = useFresh(unread);
    const label = unread ? `${unread} ta yangi bildirishnoma` : "Bildirishnomalar";

    return (
        <Link
            href={HREF}
            onClick={() => writeSeen(unread)}
            title={label}
            aria-label={label}
            className={cn(
                "relative grid size-9 place-items-center rounded-lg border transition-colors",
                unread
                    ? "tone-rose border-tone-line bg-tone-soft text-tone-text"
                    : "border-line text-muted hover:border-accent hover:text-accent",
                className,
            )}
        >
            <Icon name="bell" size={17} className={cn(fresh && "bell-ring")} />
            {unread > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-tone px-1 text-[10.5px] font-bold leading-none text-page ring-2 ring-page">
                    {unread > 9 ? "9+" : unread}
                </span>
            )}
        </Link>
    );
}

/** Sarlavha ostidan chiqadigan yorliq: «Sizga yangi xabar keldi». */
export function NewNoticeCallout({ unread, className }: { unread: number; className?: string }) {
    const fresh = useFresh(unread);

    useEffect(() => {
        if (!fresh) return;
        const timer = setTimeout(() => writeSeen(unread), 12_000);
        return () => clearTimeout(timer);
    }, [fresh, unread]);

    if (!fresh) return null;

    return (
        <div className={cn("tone-rose notice-pop notice-anchor absolute top-full z-50 mt-2.5", className)}>
            {/* Qo'ng'iroqchaga qaragan uchburchak */}
            <span
                aria-hidden
                className="notice-arrow absolute -top-1.5 size-3 rotate-45 rounded-[3px] border-l border-t border-tone-line bg-page"
            />

            <div className="relative flex items-center gap-3 rounded-2xl border border-tone-line bg-page p-3 pr-2 shadow-[0_18px_50px_-18px_color-mix(in_oklab,var(--tone)_60%,transparent)]">
                <Link
                    href={HREF}
                    onClick={() => writeSeen(unread)}
                    className="group flex min-w-0 flex-1 items-center gap-3"
                >
                    <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-tone-soft text-tone-text">
                        <span
                            aria-hidden
                            className="absolute inset-0 animate-ping rounded-full bg-tone opacity-20"
                        />
                        <Icon name="bell" size={18} className="bell-ring relative" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-[13.5px] font-semibold leading-snug">
                            Sizga yangi xabar keldi
                        </span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-tone-text">
                            Ko&apos;rish uchun bosing
                            <Icon
                                name="arrowRight"
                                size={12}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </span>
                    </span>
                </Link>

                <button
                    type="button"
                    onClick={() => writeSeen(unread)}
                    aria-label="Yopish"
                    className="grid size-7 shrink-0 place-items-center self-start rounded-full text-faint transition-colors hover:bg-surface hover:text-text"
                >
                    <Icon name="close" size={13} />
                </button>
            </div>
        </div>
    );
}
