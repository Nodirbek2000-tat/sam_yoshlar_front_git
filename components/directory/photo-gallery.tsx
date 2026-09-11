"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { Icon } from "@/components/icon";
import type { GalleryImage } from "@/lib/types";

/**
 * Biznes rasmlari: to'r ko'rinishida, bosilganda to'liq ekranda.
 * Strelkalar va Esc bilan boshqariladi.
 */
export function PhotoGallery({ photos, name }: { photos: GalleryImage[]; name: string }) {
    const [open, setOpen] = useState<number | null>(null);

    const close = useCallback(() => setOpen(null), []);
    const step = useCallback(
        (delta: number) =>
            setOpen((current) =>
                current === null ? current : (current + delta + photos.length) % photos.length,
            ),
        [photos.length],
    );

    useEffect(() => {
        if (open === null) return;

        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [open, close, step]);

    if (!photos.length) return null;

    return (
        <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo, index) => (
                    <button
                        key={photo.id}
                        type="button"
                        onClick={() => setOpen(index)}
                        className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-surface"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photo.url}
                            alt={photo.caption || `${name} — ${index + 1}-rasm`}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100">
                            <Icon name="search" size={22} />
                        </span>
                    </button>
                ))}
            </div>

            <AnimatePresence>
                {open !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[90] grid place-items-center bg-black/90 p-4 backdrop-blur-sm"
                        onClick={close}
                        role="dialog"
                        aria-label="Rasm"
                    >
                        <motion.img
                            key={photos[open].id}
                            src={photos[open].url}
                            alt={photos[open].caption || name}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className="max-h-[86vh] max-w-full rounded-xl object-contain shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                        />

                        <button
                            type="button"
                            onClick={close}
                            aria-label="Yopish"
                            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                        >
                            <Icon name="close" size={20} />
                        </button>

                        {photos.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Oldingi"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        step(-1);
                                    }}
                                    className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                                >
                                    <Icon name="arrowLeft" size={20} />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Keyingi"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        step(1);
                                    }}
                                    className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                                >
                                    <Icon name="arrowRight" size={20} />
                                </button>
                                <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[12.5px] tabular-nums text-white">
                                    {open + 1} / {photos.length}
                                </span>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
