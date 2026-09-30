"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Markazda ochiladigan oyna — forma va savollar uchun.
 *
 * `body` ga ko'chiriladi: sarlavhadagi `backdrop-blur` ichida `fixed`
 * element sarlavha chegarasida qolib ketadi. Faqat brauzerda, foydalanuvchi
 * biror narsani bosgandan keyin yuklanadi (`dynamic`, `ssr: false`).
 */
export function Dialog({
    open,
    onClose,
    label,
    locked = false,
    className,
    children,
}: {
    open: boolean;
    onClose: () => void;
    /** Ekran o'quvchilar uchun oyna nomi */
    label: string;
    /** So'rov ketayotganda — tashqarisini bosib yoki Esc bilan yopilmaydi */
    locked?: boolean;
    className?: string;
    children: ReactNode;
}) {
    useEffect(() => {
        if (!open) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !locked) onClose();
        };
        window.addEventListener("keydown", onKey);

        // Oyna ochiqligida orqadagi sahifa siljimasin
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [open, locked, onClose]);

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    key="dialog"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[90] grid place-items-end bg-black/50 backdrop-blur-sm sm:place-items-center sm:p-5"
                    onClick={() => !locked && onClose()}
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label={label}
                        initial={{ opacity: 0, y: 32, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        onClick={(event) => event.stopPropagation()}
                        className={cn(
                            // Telefonda pastdan chiqadi, katta ekranda markazda
                            "relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-page p-6 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7",
                            className,
                        )}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -top-28 left-1/2 size-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--tone)_24%,transparent),transparent_70%)]"
                        />

                        {!locked && (
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Yopish"
                                className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full text-faint transition-colors hover:bg-surface hover:text-text"
                            >
                                <Icon name="close" size={16} />
                            </button>
                        )}

                        <div className="relative">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
