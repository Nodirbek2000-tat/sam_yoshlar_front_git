"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

import { formatNumber } from "@/lib/format";

/**
 * Ekranga kirganda yumshoq chiqadigan blok.
 * Bir marta ishlaydi — qayta aylantirilganda takrorlanmaydi.
 */
export function Reveal({
    children,
    delay = 0,
    y = 16,
    className,
}: {
    children: ReactNode;
    delay?: number;
    y?: number;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-64px" }}
            transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

/** Bolalarini ketma-ket chiqaradi. */
export function Stagger({
    children,
    className,
    step = 0.07,
}: {
    children: ReactNode;
    className?: string;
    step?: number;
}) {
    return (
        <motion.div
            className={className}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: "-64px" }}
            variants={{ shown: { transition: { staggerChildren: step } } }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            variants={{
                hidden: { opacity: 0, y: 18 },
                shown: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
            }}
        >
            {children}
        </motion.div>
    );
}

/** Ko'ringanda 0 dan `value` gacha sanaydigan raqam. */
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
    const inView = useInView(ref, { once: true, margin: "-40px" });
    const count = useMotionValue(0);
    const text = useTransform(count, (latest) => formatNumber(Math.round(latest)));

    useEffect(() => {
        if (!inView) return;
        const controls = animate(count, value, {
            duration,
            ease: [0.22, 1, 0.36, 1],
        });
        return () => controls.stop();
    }, [inView, value, duration, count]);

    return (
        <motion.span ref={ref} className={className}>
            {text}
        </motion.span>
    );
}
