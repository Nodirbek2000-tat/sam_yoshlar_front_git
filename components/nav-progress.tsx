"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sahifa almashayotganda tepada chiqadigan ingichka chiziq.
 *
 * Next'da umumiy «navigatsiya boshlandi» hodisasi yo'q, shuning uchun
 * ichki havolalarni bosishni o'zimiz ushlaymiz: bosilganda chiziq
 * boshlanadi, manzil o'zgarganda (`usePathname`) oxiriga yetib yo'qoladi.
 *
 * Kod ichidan boshlash kerak bo'lsa (`router.push` oldidan):
 *     window.dispatchEvent(new Event("nav-progress:start"))
 */
export function NavProgress() {
    const pathname = usePathname();
    const search = useSearchParams();

    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
    const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
    const running = useRef(false);

    const stopTimers = () => {
        if (trickle.current) clearInterval(trickle.current);
        if (safety.current) clearTimeout(safety.current);
        trickle.current = null;
        safety.current = null;
    };

    const finish = useCallback(() => {
        if (!running.current) return;
        running.current = false;
        stopTimers();

        setProgress(100);
        setTimeout(() => setVisible(false), 260);
        setTimeout(() => setProgress(0), 560);
    }, []);

    const start = useCallback(() => {
        if (running.current) return;
        running.current = true;
        stopTimers();

        setVisible(true);
        setProgress(12);
        requestAnimationFrame(() => setProgress(28));

        // Asta-sekin 90% gacha — sahifa kelguncha to'xtamay «o'ylaydi»
        trickle.current = setInterval(() => {
            setProgress((value) => value + (90 - value) * 0.09);
        }, 320);

        // Biror sabab bilan manzil o'zgarmasa — osilib qolmasin
        safety.current = setTimeout(finish, 15000);
    }, [finish]);

    // Ichki havola bosilganda boshlaymiz
    useEffect(() => {
        function onClick(event: MouseEvent) {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            const anchor = (event.target as Element | null)?.closest?.("a");
            if (!anchor || !anchor.href) return;
            if (anchor.target && anchor.target !== "_self") return;
            if (anchor.hasAttribute("download")) return;

            const url = new URL(anchor.href, window.location.href);
            if (url.origin !== window.location.origin) return;

            // Xuddi shu sahifa yoki faqat #langar — navigatsiya yo'q
            if (url.pathname === window.location.pathname && url.search === window.location.search) {
                return;
            }

            start();
        }

        const onManual = () => start();

        document.addEventListener("click", onClick, true);
        window.addEventListener("nav-progress:start", onManual);
        return () => {
            document.removeEventListener("click", onClick, true);
            window.removeEventListener("nav-progress:start", onManual);
        };
    }, [start]);

    // Manzil o'zgardi — yangi sahifa keldi
    useEffect(() => {
        finish();
    }, [pathname, search, finish]);

    useEffect(() => stopTimers, []);

    return (
        <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2.5px]"
            style={{ opacity: visible ? 1 : 0, transition: "opacity 300ms ease" }}
        >
            <div
                className="relative h-full bg-gradient-to-r from-brand-400 via-accent to-brand-300"
                style={{
                    width: `${progress}%`,
                    transition:
                        progress === 0 ? "none" : "width 320ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
            >
                {/* Uchidagi yog'du */}
                <span className="absolute right-0 top-1/2 h-3 w-24 -translate-y-1/2 rounded-full bg-accent/60 blur-md" />
            </div>
        </div>
    );
}
