"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useMemo, useState } from "react";

import { renderScene } from "@/lib/scenes";
import { cn } from "@/lib/cn";
import type { Direction } from "@/lib/types";

/**
 * Yo'nalishning tirik sahnasi.
 *
 * `votes` o'zgarganda SVG qayta yig'iladi va yangi elementlar `.pop`
 * animatsiyasi bilan paydo bo'ladi — daraxtga barg qo'shilgandek.
 *
 * SVG matni faqat o'zimizning raqamlarimiz va palitramizdan yig'iladi,
 * shuning uchun `dangerouslySetInnerHTML` bu yerda xavfsiz.
 */
export function LiveScene({
    direction,
    votes,
    burst,
    className,
    ratio = "16 / 10",
}: {
    direction: Direction;
    votes: number;
    /** Ovoz berilganda ortadigan raqam — portlash animatsiyasini qayta ishga tushiradi. */
    burst?: number;
    className?: string;
    ratio?: string;
}) {
    // Bir sahifada bir nechta sahna bo'ladi — SVG id'lari to'qnashmasin
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

    // Ovoz o'zgarganda oldingi sonni eslab qolamiz — shunda faqat
    // yangi qo'shilgan element o'sib chiqadi, butun sahna emas.
    const [drawn, setDrawn] = useState(votes);
    const [before, setBefore] = useState<number | null>(null);

    if (drawn !== votes) {
        setBefore(drawn);
        setDrawn(votes);
    }

    const markup = useMemo(
        () =>
            renderScene(
                {
                    key: direction.scene || direction.id,
                    id: uid,
                    color: direction.color,
                    accent: direction.accent,
                    max: direction.max,
                },
                votes,
                // Birinchi chizishda hech narsa sakramasin
                before ?? Infinity,
            ),
        [
            direction.scene,
            direction.id,
            direction.color,
            direction.accent,
            direction.max,
            uid,
            votes,
            before,
        ],
    );

    return (
        <div
            className={cn("scene-frame", className)}
            style={{ ["--scene" as string]: direction.color, aspectRatio: ratio }}
        >
            {/* Nozik to'r — sahna "ekran" ustida turgandek ko'rinsin */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                    color: direction.color,
                }}
            />

            <svg
                viewBox={ratio === "1 / 1" ? "120 20 660 520" : "0 0 900 560"}
                preserveAspectRatio="xMidYMid meet"
                role="img"
                aria-label={`${direction.title}: ${votes} ${direction.unit}`}
                className="scene-svg relative size-full"
                dangerouslySetInnerHTML={{ __html: markup }}
            />

            {/* Ovoz berilganda: kengayuvchi halqa va ko'tarilib ketadigan "+1" */}
            <AnimatePresence>
                {burst ? (
                    <motion.span
                        key={burst}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 grid place-items-center"
                    >
                        <motion.span
                            initial={{ scale: 0.2, opacity: 0.75 }}
                            animate={{ scale: 2.4, opacity: 0 }}
                            transition={{ duration: 1.1, ease: "easeOut" }}
                            className="absolute size-24 rounded-full"
                            style={{ border: `2px solid ${direction.color}` }}
                        />
                        <motion.span
                            initial={{ y: 14, opacity: 0, scale: 0.8 }}
                            animate={{ y: -26, opacity: [0, 1, 1, 0], scale: 1 }}
                            transition={{ duration: 1.3, ease: "easeOut" }}
                            className="text-[15px] font-semibold tabular-nums"
                            style={{ color: direction.accent }}
                        >
                            +1
                        </motion.span>
                    </motion.span>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
