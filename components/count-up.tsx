"use client";

import { useEffect, useRef, useState } from "react";

import { formatNumber } from "@/lib/format";

/** Motion'dagi `[0.22, 1, 0.36, 1]` egri chizig'iga yaqin — sekinlashib to'xtaydi */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * Ko'ringanda 0 dan `value` gacha sanaydigan raqam (kutubxonasiz).
 *
 * Serverdan **haqiqiy son** bilan keladi — JS sekin yuklansa ham «0» ko'rinib
 * turmaydi. Sahifa ochilganda raqam allaqachon ekranda bo'lsa, qayta
 * sanalmaydi (miltillamasin); pastda bo'lsa — ko'ringanda sanaydi.
 */
export function CountUp({
    value,
    duration = 1.4,
    className,
}: {
    value: number;
    duration?: number;
    className?: string;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [shown, setShown] = useState(value);

    useEffect(() => {
        const element = ref.current;
        if (!element || typeof IntersectionObserver === "undefined") return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let frame = 0;
        let first = true;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (first) {
                    first = false;
                    // Allaqachon ko'rinib turibdi — tegmaymiz
                    if (entry.isIntersecting) {
                        observer.disconnect();
                        return;
                    }
                    setShown(0);
                    return;
                }
                if (!entry.isIntersecting) return;
                observer.disconnect();

                const started = performance.now();
                const tick = (now: number) => {
                    const progress = Math.min(1, (now - started) / (duration * 1000));
                    setShown(Math.round(value * easeOut(progress)));
                    if (progress < 1) frame = requestAnimationFrame(tick);
                };
                frame = requestAnimationFrame(tick);
            },
            { rootMargin: "0px 0px -40px 0px" },
        );

        observer.observe(element);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
        };
    }, [value, duration]);

    return (
        <span ref={ref} className={className}>
            {formatNumber(shown)}
        </span>
    );
}
