"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { LiveScene } from "@/components/initiatives/live-scene";
import { isMuted, playChime, setMuted } from "@/lib/chime";
import type { Direction } from "@/lib/types";

/**
 * Sarlavhadagi yo'nalish tasviri.
 *
 * Rasm `public/yonalish/<id>.webp` dan olinadi. Yo'nalish almashganda
 * eskisi so'nib chiqadi, yangisi kattalashib kiradi va qisqa ohang
 * chalinadi. Rasm topilmasa — o'sha yo'nalishning tirik sahnasi.
 *
 * Ovoz faqat almashganda chalinadi, sahifa ochilganda emas. Yonidagi
 * kichik tugma bilan butunlay o'chirib qo'yish mumkin.
 */
export function HeroOrbit({ direction }: { direction: Direction }) {
    const [broken, setBroken] = useState<Record<string, boolean>>({});
    const [quiet, setQuiet] = useState(true);

    // Birinchi chizishda ovoz bo'lmasin — faqat almashganda
    const previous = useRef<string | null>(null);

    useEffect(() => {
        setQuiet(isMuted());
    }, []);

    useEffect(() => {
        if (previous.current !== null && previous.current !== direction.id) {
            playChime(direction.id);
        }
        previous.current = direction.id;
    }, [direction.id]);

    const hasImage = !broken[direction.id];

    return (
        <div
            className="relative w-64 sm:w-80 md:w-96"
            style={{ ["--scene" as string]: direction.color }}
        >
            {/* Orqadagi yog'du — yo'nalish rangida */}
            <AnimatePresence>
                <motion.div
                    key={`glow-${direction.id}`}
                    aria-hidden
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="pointer-events-none absolute -inset-10 rounded-full blur-3xl"
                    style={{
                        background: `radial-gradient(circle, color-mix(in oklab, ${direction.color} 24%, transparent), transparent 70%)`,
                    }}
                />
            </AnimatePresence>

            <div className="relative grid aspect-square place-items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={direction.id}
                        initial={{ opacity: 0, scale: 0.82, y: 18, filter: "blur(8px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.08, y: -14, filter: "blur(6px)" }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 grid place-items-center"
                    >
                        {hasImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={`/yonalish/${direction.id}.webp`}
                                alt={direction.title}
                                width={900}
                                height={900}
                                className="size-full object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.4)]"
                                onError={() =>
                                    setBroken((current) => ({ ...current, [direction.id]: true }))
                                }
                            />
                        ) : (
                            <LiveScene
                                direction={direction}
                                votes={direction.votes}
                                ratio="1 / 1"
                                className="w-full"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Ovozni o'chirish */}
            <button
                type="button"
                onClick={() => {
                    const next = !quiet;
                    setQuiet(next);
                    setMuted(next);
                    if (!next) playChime(direction.id);
                }}
                title={quiet ? "Ovozni yoqish" : "Ovozni o'chirish"}
                aria-label={quiet ? "Ovozni yoqish" : "Ovozni o'chirish"}
                className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full border border-line bg-page/70 text-muted backdrop-blur transition-colors hover:text-text"
            >
                <Icon name={quiet ? "volumeOff" : "volume"} size={15} />
            </button>
        </div>
    );
}
