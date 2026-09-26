"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Bosh sahifaning harakat qatlami.
 *
 * Aylantirishdagi animatsiyalar endi CSS'da (`globals.css` → «Chiqish
 * animatsiyalari») va umumiy `FxScript` bilan ishlaydi — kutubxonasiz:
 *
 *   data-fx="heading"  sarlavha so'zma-so'z pastdan chiqadi (<Words>)
 *   data-fx="rise"     blok yumshoq ko'tarilib chiqadi
 *   data-fx="cards"    ichidagi kartalar to'lqin bo'lib kiradi
 *   data-fx="rows"     qatorlar chapdan sirg'alib kiradi
 *   data-fx="fill"     matn o'qilgan sari to'ladi (brauzer qo'llasa)
 *   data-speed         parallaks (brauzer qo'llasa)
 *
 * Bu yerda faqat Lenis — sichqoncha g'ildiragida yumshoq aylantirish. U
 * faqat kompyuterda va sahifa to'liq yuklangandan **keyin** fonda yuklanadi:
 * telefonga (u yerda barmoq bilan aylantiriladi) umuman yuborilmaydi.
 */
export function HomeFx({ children }: { children: ReactNode }) {
    useEffect(() => {
        const fine = window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!fine || reduce) return;

        let lenis: { destroy: () => void } | null = null;
        let cancelled = false;

        const start = () => {
            import("lenis").then(({ default: Lenis }) => {
                if (cancelled) return;
                lenis = new Lenis({
                    duration: 1.15,
                    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                    autoRaf: true,
                });
            });
        };

        // Sahifa yuklanib, brauzer bo'shaganda — asosiy ish to'xtamasin
        // (Safari'da requestIdleCallback yo'q — oddiy kechiktirish)
        const idle = () => {
            if (typeof window.requestIdleCallback === "function") {
                window.requestIdleCallback(start, { timeout: 3000 });
            } else {
                setTimeout(start, 1200);
            }
        };

        if (document.readyState === "complete") idle();
        else window.addEventListener("load", idle, { once: true });

        return () => {
            cancelled = true;
            window.removeEventListener("load", idle);
            lenis?.destroy();
        };
    }, []);

    return <div>{children}</div>;
}
