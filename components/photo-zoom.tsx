"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icon";

/**
 * Profil rasmi — bosilganda to'liq ekranda kattalashadi.
 *
 * Rasm bo'lmasa ism harflari chiqadi va hech narsa ochilmaydi.
 * Esc yoki fon bosilsa yopiladi.
 */
export function PhotoZoom({
    src,
    alt,
    fallback,
    color,
    className = "",
}: {
    src: string | null;
    alt: string;
    /** Rasm yo'q bo'lsa ko'rinadigan harflar */
    fallback: string;
    /** Orqa fon rangi (davlat rangi) */
    color?: string;
    className?: string;
}) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;

        const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const box = `grid shrink-0 place-items-center overflow-hidden text-2xl font-semibold text-white ${className}`;

    if (!src) {
        return (
            <span className={box} style={{ background: color }}>
                {fallback}
            </span>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Rasmni kattalashtirish"
                className={`group relative ${box}`}
                style={{ background: color }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={alt} className="size-full object-cover" />
                <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-all duration-300 group-hover:bg-black/30 group-hover:opacity-100">
                    <Icon name="search" size={20} />
                </span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-[80] grid place-items-center bg-black/85 p-5 backdrop-blur-sm"
                    >
                        <motion.img
                            src={src}
                            alt={alt}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(event) => event.stopPropagation()}
                            className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
                        />

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Yopish"
                            className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        >
                            <Icon name="close" size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
