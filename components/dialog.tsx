"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

const FOCUSABLE =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Oyna ichidagi, ko'rinib turgan, bosib bo'ladigan elementlar. */
function focusables(panel: HTMLElement) {
    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.getClientRects().length > 0,
    );
}

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
    const panelRef = useRef<HTMLDivElement>(null);
    // Eng so'nggi `onClose`/`locked` — effekt har qayta chizilishda qayta ishlamasin
    // (aks holda fokus oyna boshiga sakrab ketardi)
    const latest = useRef({ onClose, locked });
    useEffect(() => {
        latest.current = { onClose, locked };
    });

    useEffect(() => {
        if (!open) return;

        // Klaviatura bilan ishlovchi uchun: fokus oyna ichiga o'tadi, Tab tashqariga
        // chiqmaydi, yopilgach esa oynani ochgan tugmaga qaytadi
        const opener =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        // Fokus: `data-autofocus` belgilangan tugmaga, bo'lmasa oynaning o'ziga —
        // telefonda maydonga tushib, klaviatura oynani yopib qo'ymasin
        // (oyna shu paytda DOM'da bor — kadr kutish shart emas; yashirin varaqda
        // requestAnimationFrame umuman ishlamasligi ham mumkin)
        const panel = panelRef.current;
        if (panel && !panel.contains(document.activeElement)) {
            (panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel).focus({
                preventScroll: true,
            });
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !latest.current.locked) {
                latest.current.onClose();
                return;
            }
            if (event.key !== "Tab") return;

            const panel = panelRef.current;
            if (!panel) return;
            const items = focusables(panel);
            const active = document.activeElement;
            // Oynaning o'zi fokusda bo'lsa ham — Tab ichkarida aylanadi
            const outside = active === panel || !panel.contains(active);
            if (!items.length) {
                event.preventDefault();
                panel.focus();
            } else if (event.shiftKey && (active === items[0] || outside)) {
                event.preventDefault();
                items[items.length - 1].focus();
            } else if (!event.shiftKey && (active === items[items.length - 1] || outside)) {
                event.preventDefault();
                items[0].focus();
            }
        };
        window.addEventListener("keydown", onKey);

        // Oyna ochiqligida orqadagi sahifa siljimasin
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
            if (opener?.isConnected) opener.focus();
        };
    }, [open]);

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
                        ref={panelRef}
                        tabIndex={-1}
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
                            "relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl outline-none border border-line bg-page p-6 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7",
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
                                data-dialog-close
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
