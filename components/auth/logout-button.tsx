"use client";

import { LogOut } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/icon";

/**
 * Chiqish tugmasi — bosilganda so'raydi, tasdiqlansa «Xayr» deb qo'l
 * silkitib chiqaradi.
 *
 * Oyna `body` ga ko'chiriladi: sarlavhadagi `backdrop-blur` ichida
 * `fixed` element sarlavha chegarasida qolib ketadi.
 */
export function LogoutButton({
    name,
    className,
    children,
    redirectTo = "/",
}: {
    /** «Xayr, Aziz!» — ismning birinchi so'zi olinadi */
    name?: string;
    className?: string;
    children?: ReactNode;
    redirectTo?: string;
}) {
    const router = useRouter();
    // Portal faqat birinchi bosishdan keyin quriladi — server HTML bilan to'qnashmasin
    const [armed, setArmed] = useState(false);
    const [open, setOpen] = useState(false);
    const [leaving, setLeaving] = useState(false);

    const firstName = name?.trim().split(/\s+/)[0];

    useEffect(() => {
        if (!open || leaving) return;
        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, leaving]);

    async function logout() {
        setLeaving(true);
        await Promise.all([
            fetch("/api/auth/logout", { method: "POST" }).catch(() => null),
            // Qo'l silkitish ko'rinib ulgursin
            new Promise((resolve) => setTimeout(resolve, 1200)),
        ]);
        router.replace(redirectTo as "/");
        router.refresh();
        setOpen(false);
        setLeaving(false);
    }

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setArmed(true);
                    setOpen(true);
                }}
                title="Chiqish"
                aria-label="Chiqish"
                className={className}
            >
                {children ?? <Icon name="power" size={15} />}
            </button>

            {armed &&
                createPortal(
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                key="logout"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-[90] grid place-items-center bg-black/45 p-5 backdrop-blur-sm"
                                onClick={() => !leaving && setOpen(false)}
                            >
                                <motion.div
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Chiqish"
                                    initial={{ opacity: 0, y: 24, scale: 0.94 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 16, scale: 0.96 }}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    onClick={(event) => event.stopPropagation()}
                                    className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-page p-7 text-center shadow-2xl"
                                >
                                    <div
                                        aria-hidden
                                        className="pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_70%)]"
                                    />

                                    <AnimatePresence mode="wait" initial={false}>
                                        {leaving ? (
                                            <motion.div
                                                key="bye"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="relative py-4"
                                            >
                                                <motion.span
                                                    className="inline-block origin-[70%_80%] text-6xl"
                                                    animate={{ rotate: [0, 18, -10, 18, -6, 12, 0] }}
                                                    transition={{ duration: 1.1, ease: "easeInOut" }}
                                                    aria-hidden
                                                >
                                                    👋
                                                </motion.span>
                                                <p className="mt-4 text-xl font-semibold tracking-tight">
                                                    Xayr{firstName ? `, ${firstName}` : ""}!
                                                </p>
                                                <p className="mt-1.5 text-[14px] text-muted">
                                                    Yana kutib qolamiz.
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="ask"
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="relative"
                                            >
                                                <motion.span
                                                    className="mx-auto grid size-16 place-items-center rounded-2xl border border-line bg-surface text-text"
                                                    initial={{ rotate: -12, scale: 0.6 }}
                                                    animate={{ rotate: 0, scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.05 }}
                                                >
                                                    <LogOut className="size-7" strokeWidth={1.7} />
                                                </motion.span>

                                                <h2 className="mt-5 text-xl font-semibold tracking-tight">
                                                    Chiqmoqchimisiz?
                                                </h2>
                                                <p className="mt-2 text-[14px] leading-relaxed text-muted">
                                                    Qayta kirish uchun Telegram botdan yangi kod olasiz.
                                                </p>

                                                <div className="mt-6 grid grid-cols-2 gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setOpen(false)}
                                                        className="rounded-xl border border-line py-3 text-[14px] font-medium transition-colors hover:bg-surface"
                                                    >
                                                        Qolaman
                                                    </button>
                                                    <motion.button
                                                        type="button"
                                                        onClick={logout}
                                                        whileTap={{ scale: 0.97 }}
                                                        className="rounded-xl bg-invert py-3 text-[14px] font-semibold text-on-invert transition-opacity hover:opacity-90"
                                                    >
                                                        Ha, chiqaman
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
}
