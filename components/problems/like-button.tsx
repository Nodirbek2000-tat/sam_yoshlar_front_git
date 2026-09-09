"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Taklifga layk. Bosilganda qo'yiladi, yana bosilsa olib tashlanadi.
 *
 * Javobni kutmasdan darhol ko'rsatamiz; server rad qilsa orqaga qaytaramiz.
 * Mehmon bosса kirish sahifasiga yuboriladi — ruxsatni Django ham tekshiradi.
 */
export function LikeButton({
    solutionId,
    likes,
    liked,
    canLike,
    returnTo,
    onChange,
}: {
    solutionId: number;
    likes: number;
    liked: boolean;
    canLike: boolean;
    returnTo: string;
    /** Ro'yxat tartibi layk soniga bog'liq — o'zgarishni tepaga bildiramiz. */
    onChange?: (next: { count: number; liked: boolean }) => void;
}) {
    const router = useRouter();
    const [count, setCount] = useState(likes);
    const [on, setOn] = useState(liked);
    const [busy, setBusy] = useState(false);

    async function toggle() {
        if (!canLike) {
            router.push(`/kirish?next=${encodeURIComponent(returnTo)}`);
            return;
        }
        if (busy) return;

        const next = !on;
        const nextCount = count + (next ? 1 : -1);
        setBusy(true);
        setOn(next);
        setCount(nextCount);
        onChange?.({ count: nextCount, liked: next });

        try {
            const response = await fetch(`/api/proxy/solutions/${solutionId}/like`, {
                method: "POST",
            });

            if (!response.ok) {
                setOn(on);
                setCount(count);
                onChange?.({ count, liked: on });
                return;
            }

            const data = (await response.json()) as { liked: boolean; like_count: number };
            setOn(data.liked);
            setCount(data.like_count);
            onChange?.({ count: data.like_count, liked: data.liked });

            // Tartibni ro'yxat o'zi qayta hisoblaydi; server holatini ham yangilaymiz
            if (!onChange) router.refresh();
        } catch {
            setOn(on);
            setCount(count);
            onChange?.({ count, liked: on });
        } finally {
            setBusy(false);
        }
    }

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={busy}
            title={on ? "Laykni olib tashlash" : "Yoqdi"}
            aria-pressed={on}
            className={cn(
                "group inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors duration-200",
                on
                    ? "border-tone-line bg-tone-soft font-medium text-tone-text"
                    : "border-line text-muted hover:border-tone-line hover:bg-tone-soft hover:text-tone-text",
            )}
        >
            <motion.span
                key={String(on)}
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="grid place-items-center"
            >
                <Icon
                    name="heart"
                    size={14}
                    className={cn(
                        "transition-transform duration-200",
                        on ? "fill-current" : "group-hover:-translate-y-0.5",
                    )}
                />
            </motion.span>
            <span className="font-semibold tabular-nums">{count}</span>
        </button>
    );
}
