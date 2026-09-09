"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

/**
 * Yo'nalishning tirik sahnasi.
 *
 * Ovoz soni `max` ga yaqinlashgan sari sahna to'ladi: nuqtalar ko'payadi,
 * yorug'lik kuchayadi. Har bir yo'nalish uchun bir xil mantiq, faqat rang
 * va zichlik farq qiladi — shuning uchun 14 ta alohida chizmа kerak emas.
 */
export function DirectionScene({
    votes,
    max,
    color,
    accent,
    seed = 1,
    className,
}: {
    votes: number;
    max: number;
    color: string;
    accent: string;
    seed?: number;
    className?: string;
}) {
    const fill = Math.max(0, Math.min(votes / Math.max(max, 1), 1));

    // Nuqtalar joyi `seed` bo'yicha barqaror — qayta chizilganda sakramaydi
    const dots = useMemo(() => {
        const total = 46;
        const random = mulberry(seed * 9973 + 17);
        return Array.from({ length: total }, (_, index) => {
            const angle = random() * Math.PI * 2;
            const radius = 8 + Math.sqrt(random()) * 40;
            // Serverda va brauzerda `Math.cos` oxirgi raqamda farq qilishi mumkin —
            // yaxlitlamasak React gidratatsiyada nomuvofiqlik deb shikoyat qiladi.
            return {
                x: round(50 + Math.cos(angle) * radius * 0.92),
                y: round(50 + Math.sin(angle) * radius * 0.58),
                size: round(0.7 + random() * 1.7),
                delay: round((index / total) * 0.9),
                threshold: index / total,
            };
        });
    }, [seed]);

    const active = dots.filter((dot) => dot.threshold <= fill);

    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
        >
            <defs>
                <radialGradient id={`glow-${seed}`}>
                    <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={accent} stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Yumshoq yorug'lik — ovoz ko'paygan sari kuchayadi */}
            <circle
                cx="50"
                cy="50"
                r={26 + fill * 20}
                fill={`url(#glow-${seed})`}
                opacity={0.35 + fill * 0.65}
            />

            {/* Halqa — to'lish darajasi */}
            <circle
                cx="50"
                cy="50"
                r="34"
                fill="none"
                stroke={color}
                strokeWidth="0.6"
                strokeOpacity="0.18"
            />
            <motion.circle
                cx="50"
                cy="50"
                r="34"
                fill="none"
                stroke={color}
                strokeWidth="1.4"
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                strokeDasharray={2 * Math.PI * 34}
                initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                whileInView={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - fill) }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Ekotizim nuqtalari */}
            {active.map((dot, index) => (
                <motion.circle
                    key={index}
                    cx={dot.x}
                    cy={dot.y}
                    r={dot.size}
                    fill={index % 4 === 0 ? accent : color}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 0.9, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.5,
                        delay: dot.delay * 0.6,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                />
            ))}

            {/* Markaz — yo'nalishning o'zagi */}
            <circle cx="50" cy="50" r={2.6 + fill * 1.6} fill={color} />
        </svg>
    );
}

/** Uch xonagacha yaxlitlaydi — server va brauzer bir xil son chiqaradi. */
function round(value: number) {
    return Math.round(value * 1000) / 1000;
}

/** Kichik determinatsiyalangan tasodifiy generator (bir xil seed — bir xil natija). */
function mulberry(seed: number) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
