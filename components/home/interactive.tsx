"use client";

import Link from "next/link";
import { useRef, type PointerEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Bosh sahifaning qo'lga «javob beradigan» qismlari — kutubxonasiz.
 *
 * MagneticLink — kursor yaqinlashganda tugma unga tortiladi, qo'yib
 *                yuborilganda prujina bilan joyiga qaytadi.
 * SpotlightCard — karta kursor tomonga biroz egiladi, chegara va ichi
 *                 kursor turgan joyda yonadi.
 *
 * Harakat CSS o'tishlari bilan: JS faqat kursor joyini o'zgaruvchiga yozadi,
 * React qayta chizilmaydi. Faqat sichqonchada ishlaydi (telefonda keraksiz).
 */

/** Prujinaga o'xshash — biroz oshib, joyiga qaytadi */
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function motionAllowed(event: PointerEvent) {
    return (
        event.pointerType === "mouse" &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}

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
    function onMove(event: PointerEvent<HTMLDivElement>) {
        if (!motionAllowed(event)) return;
        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();
        element.style.translate = `${(event.clientX - rect.left - rect.width / 2) * strength}px ${
            (event.clientY - rect.top - rect.height / 2) * strength
        }px`;
    }

    function onLeave(event: PointerEvent<HTMLDivElement>) {
        event.currentTarget.style.translate = "0px 0px";
    }

    return (
        <div
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            className="inline-flex transition-[translate,scale] duration-500 active:scale-95"
            style={{ transitionTimingFunction: SPRING }}
        >
            <Link href={href} className={className}>
                {children}
            </Link>
        </div>
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
    const ref = useRef<HTMLDivElement>(null);

    function onMove(event: PointerEvent<HTMLDivElement>) {
        const element = ref.current;
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        // Yog'du uchun — CSS o'zgaruvchilari (ichki `spotlight` ham shu yerdan o'qiydi)
        element.style.setProperty("--mx", `${px * 100}%`);
        element.style.setProperty("--my", `${py * 100}%`);

        if (motionAllowed(event)) {
            element.style.setProperty("--rx", `${(0.5 - py) * tilt}deg`);
            element.style.setProperty("--ry", `${(px - 0.5) * tilt}deg`);
        }
    }

    function onLeave() {
        ref.current?.style.setProperty("--rx", "0deg");
        ref.current?.style.setProperty("--ry", "0deg");
    }

    return (
        <div
            ref={ref}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
            style={{
                transform: "perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
            }}
            className={cn(
                "spotlight-border h-full rounded-2xl p-px transition-transform duration-500 ease-out",
                className,
            )}
        >
            {children}
        </div>
    );
}
