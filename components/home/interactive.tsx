"use client";

import { motion, useReducedMotion, useSpring } from "motion/react";
import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Bosh sahifaning qo'lga «javob beradigan» qismlari (Motion).
 *
 * MagneticLink — kursor yaqinlashganda tugma unga tortiladi, qo'yib
 *                yuborilganda prujina bilan joyiga qaytadi.
 * SpotlightCard — karta kursor tomonga biroz egiladi, chegara va ichi
 *                 kursor turgan joyda yonadi.
 */

const SPRING = { stiffness: 260, damping: 18, mass: 0.5 };

export function MagneticLink({
    href,
    className,
    children,
    strength = 0.28,
}: {
    href: string;
    className?: string;
    children: ReactNode;
    strength?: number;
}) {
    const reduce = useReducedMotion();
    const x = useSpring(0, SPRING);
    const y = useSpring(0, SPRING);

    function onMove(event: PointerEvent<HTMLDivElement>) {
        if (reduce || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set((event.clientX - rect.left - rect.width / 2) * strength);
        y.set((event.clientY - rect.top - rect.height / 2) * strength);
    }

    function onLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            style={{ x, y }}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            whileTap={{ scale: 0.95 }}
            className="inline-flex"
        >
            <Link href={href} className={className}>
                {children}
            </Link>
        </motion.div>
    );
}

export function SpotlightCard({
    className,
    children,
    tilt = 7,
}: {
    className?: string;
    children: ReactNode;
    /** Egilish darajasi (gradus) */
    tilt?: number;
}) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const rotateX = useSpring(0, { stiffness: 200, damping: 20 });
    const rotateY = useSpring(0, { stiffness: 200, damping: 20 });

    function onMove(event: PointerEvent<HTMLDivElement>) {
        const element = ref.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        // Yog'du uchun — CSS o'zgaruvchilari (ichki `spotlight` ham shu yerdan o'qiydi)
        element.style.setProperty("--mx", `${px * 100}%`);
        element.style.setProperty("--my", `${py * 100}%`);

        if (!reduce && event.pointerType === "mouse") {
            rotateX.set((0.5 - py) * tilt);
            rotateY.set((px - 0.5) * tilt);
        }
    }

    function onLeave() {
        rotateX.set(0);
        rotateY.set(0);
    }

    return (
        <motion.div
            ref={ref}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            style={{ rotateX, rotateY, transformPerspective: 900 }}
            className={cn("spotlight-border h-full rounded-2xl p-px", className)}
        >
            {children}
        </motion.div>
    );
}
