"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

/**
 * Tadbirga yozilish / bekor qilish — bitta tugma.
 *
 * Mehmon bosgansa kirish sahifasiga yuboriladi. Server ham buni tekshiradi,
 * bu yerdagi tekshiruv faqat ortiqcha so'rov yubormaslik uchun.
 */
export function RegisterButton({
    slug,
    registered,
    seatsLeft,
    isFull,
    isPast,
    canRegister,
}: {
    slug: string;
    registered: boolean;
    seatsLeft: number;
    isFull: boolean;
    isPast: boolean;
    canRegister: boolean;
}) {
    const router = useRouter();
    const [joined, setJoined] = useState(registered);
    const [seats, setSeats] = useState(seatsLeft);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    if (isPast) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-[14px] text-faint">
                <Icon name="clock" size={15} />
                Tadbir o&apos;tib ketgan
            </span>
        );
    }

    async function toggle() {
        if (!canRegister) {
            router.push(`/kirish?next=/tadbirlar/${slug}`);
            return;
        }

        setBusy(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/proxy/events/${slug}/register`, {
                method: "POST",
            });
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.detail ?? "Amal bajarilmadi.");
                return;
            }

            setJoined(data.registered);
            setSeats(data.seats_left);
            setMessage(data.detail);
            router.refresh();
        } catch {
            setMessage("Tarmoqda xatolik.");
        } finally {
            setBusy(false);
            setTimeout(() => setMessage(null), 3500);
        }
    }

    const blocked = isFull && !joined;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={toggle}
                disabled={busy || blocked}
                className={cn(
                    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all duration-200",
                    joined
                        ? "border border-line text-muted hover:border-red-300 hover:text-red-600"
                        : "bg-invert text-on-invert hover:opacity-90",
                    blocked && "cursor-not-allowed opacity-50",
                )}
            >
                <Icon name={joined ? "check" : "ticket"} size={15} />
                {busy
                    ? "…"
                    : joined
                      ? "Siz yozilgansiz"
                      : blocked
                        ? "Joylar tugagan"
                        : "Ishtirok etaman"}
            </button>

            {!blocked && (
                <p className="mt-2 text-[12.5px] text-faint">
                    {seats > 0 ? `${seats} ta joy qoldi` : "Joylar tugadi"}
                </p>
            )}

            <AnimatePresence>
                {message && (
                    <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute left-0 top-full z-20 mt-8 w-max max-w-xs rounded-lg bg-invert px-3 py-2 text-[12.5px] leading-snug text-on-invert shadow-lg"
                    >
                        {message}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
}
