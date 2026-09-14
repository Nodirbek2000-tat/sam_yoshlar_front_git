"use client";

import { AnimatePresence, motion } from "motion/react";

/**
 * «Tayyor!» lahzasi — kirish va ro'yxatdan o'tish tugaganda ekranni
 * qisqa bayram bilan yopadi: doira ochiladi, belgi chiziladi, uchqunlar
 * atrofga sochiladi. Keyin sahifa o'zi keyingi joyga o'tadi.
 */

const SPARKS = Array.from({ length: 14 }, (_, index) => index);
const SPARK_COLORS = ["var(--accent)", "oklch(70% 0.15 250)", "oklch(80% 0.16 85)"];

export function SuccessBurst({
    show,
    title,
    subtitle,
}: {
    show: boolean;
    title: string;
    subtitle?: string;
}) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="burst"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[100] grid place-items-center bg-page/80 backdrop-blur-md"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex flex-col items-center px-6 text-center">
                        <div className="relative grid size-32 place-items-center">
                            {SPARKS.map((index) => {
                                const angle = (index / SPARKS.length) * Math.PI * 2;
                                return (
                                    <motion.span
                                        key={index}
                                        className="absolute size-2 rounded-full"
                                        style={{ background: SPARK_COLORS[index % SPARK_COLORS.length] }}
                                        initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                                        animate={{
                                            x: Math.cos(angle) * 84,
                                            y: Math.sin(angle) * 84,
                                            opacity: [0, 1, 0],
                                            scale: [0.4, 1.1, 0.5],
                                        }}
                                        transition={{ duration: 0.95, delay: 0.28, ease: "easeOut" }}
                                    />
                                );
                            })}

                            <motion.span
                                className="absolute inset-2 rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)]"
                                initial={{ scale: 0.2, opacity: 0 }}
                                animate={{ scale: [0.2, 1.3, 1], opacity: [0, 1, 1] }}
                                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                            />

                            <motion.span
                                className="relative grid size-20 place-items-center rounded-full bg-accent text-white shadow-[0_18px_40px_-12px_var(--accent)]"
                                initial={{ scale: 0, rotate: -40 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 320, damping: 17, delay: 0.08 }}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="size-10"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                >
                                    <motion.path
                                        d="M5 12.5l4.5 4.5L19 7.5"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.45, delay: 0.32, ease: "easeOut" }}
                                    />
                                </svg>
                            </motion.span>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.38, duration: 0.45 }}
                            className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl"
                        >
                            {title}
                        </motion.p>
                        {subtitle && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.45 }}
                                className="mt-2 flex items-center gap-2 text-[14.5px] text-muted"
                            >
                                <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                {subtitle}
                            </motion.p>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
